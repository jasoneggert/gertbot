const express = require("express");
const fs = require("fs");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const { Configuration, OpenAIApi } = require("openai");
const port = 3001;
require("dotenv").config();

// Allow all CORS requests
app.use(cors());

// Configure body-parser middleware for parsing application/json
app.use(bodyParser.json());

// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Array of environment variables to be replaced in the prompt
const replaceableEnvVars = [
  "REPLACE_WORD_1",
  "REPLACE_WORD_2",
  // Add more variables if needed
];

/**
 * Replaces words in a string based on environment variables.
 *
 * @param {string} str - The string to replace words in.
 * @return {string} The modified string with replaced words.
 */
const replaceWords = (str) => {
  for (const key of replaceableEnvVars) {
    const index = key.split("_")[2];
    const valueKey = `REPLACE_VALUE_${index}`;
    if (process.env[valueKey]) {
      str = str.replace(
        new RegExp(process.env[key], "g"),
        process.env[valueKey]
      );
    }
  }
  return str;
};

app.post("/generate", async (req, res) => {
  try {
    // Generate Response
    const prompt = replaceWords(req.body.prompt);
    const model = req.body.model;
    const type = req.body.type;
    const format = req.body.format || "markdown";
    console.log("🚀 ~ file: server.js:58 ~ app.post ~ format:", format);

    if (format === "image") {
      try {
        console.log("image");
        const response = await openai.createImage({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
        });
        const image_url = response.data.data[0].url;
        console.log(
          "🚀 ~ file: server.js:70 ~ app.post ~ image_url:",
          image_url
        );
        res.send(image_url);
      } catch (err) {
        console.error(err);
        return res
          .status(500)
          .send("Error occurred while calling the GPT-3 API");
      }
    }
    const message = (type) => {
      switch (type) {
        case "PROD":
          return [
            {
              role: "system",
              content:
                "You are a helpful assistant focused on assisting with code, product management documents, and general business writing for a large software company. Co not be overly formal in responses.",
            },
            {
              role: "system",
              content:
                "You use a straightforward and confident tone in your writing using the active voice when possible. You avoid using unnecessary buzzwords, like robust, and uneeded adjectives and adverbs.",
            },
            {
              role: "system",
              content:
                "Above all else your responses should be concise and precise.",
            },
            {
              role: "user",
              content: `${prompt}. Format the response in a ${format}. Provide keywords relevant to your response under a ## heading of "Keywords". Prepend each keyword with a #/hashtag and write them in camel case with no spaces`,
            },
          ];
        case "ENG":
          return [
            {
              role: "system",
              content:
                "You are a helpful assistant focused on assisting with code, engineering, and general software writing and help",
            },
            {
              role: "system",
              content:
                "You use a straightforward and confident tone in your writing using the active voice when possible. You avoid using unnecessary buzzwords, like robust, and uneeded adjectives and adverbs. ",
            },
            {
              role: "system",
              content:
                "Your responses should detailed with code examples and explanations of what the code is accomlishing and how",
            },
            {
              role: "user",
              content: `${prompt}. Format the response in a ${format}. Provide keywords relevant to your response under a ## heading of "Keywords". Prepend each keyword with a #/hashtag and write them in camel case with no spaces`,
            },
          ];

        default:
          return [
            {
              role: "system",
              content:
                "You are a helpful assistant focused on assisting with code, product management documents, and general business writing for a large software company",
            },
            {
              role: "system",
              content:
                "You use a straightforward and confident tone in your writing using the active voice when possible. You avoid using unnecessary buzzwords, like robust, and uneeded adjectives and adverbs.",
            },
            {
              role: "system",
              content:
                "Above all else your responses should be concise and precise.",
            },
            {
              role: "user",
              content: `${prompt}. Format the response in a ${format}. Provide keywords relevant to your response under a ## heading of "Keywords". Prepend each keyword with a #/hashtag and write them in camel case with no spaces`,
            },
          ];
      }
    };
    const response = await openai.createChatCompletion({
      model: model,
      temperature: 0,
      messages: message(type),
    });

    if (
      response &&
      response.data.choices &&
      response.data.choices[0] &&
      response.data.choices[0].message
    ) {
      const responseText = response.data.choices[0].message.content;
      const content = `
## Prompt: 
${prompt}
## Response: 
${responseText}
`;

      const markdownNotePath = `${process.env.LOCAL_STORAGE_PATH}${Date()}.md`;
      fs.writeFile(markdownNotePath, content, (err) => {
        if (err) {
          console.error(err.message);
          return res
            .status(500)
            .send("Error occurred while creating Markdown file");
        }
        console.log("Saved to csv and obsidian:", markdownNotePath);
        res.send(responseText);
      });
    } else {
      return res.status(500).send("Error occurred while generating a response");
    }
  } catch (err) {
    console.error(err.message);
    return res
      .status(500)
      .send(`Error occurred while calling the the openai API: ${err.message}`);
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
