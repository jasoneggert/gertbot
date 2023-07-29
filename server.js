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
      str = str.replace(new RegExp(process.env[key], "g"), process.env[valueKey]);
    }
  }
  return str;
};

app.post("/generate", async (req, res) => {
  try {
    // Generate Response
    const prompt = replaceWords(req.body.prompt);
    const model = req.body.model;
    const format = req.body.format || 'markdown'
    const response = await openai.createChatCompletion({
      model: model,
      temperature: 0.2,
      messages: [
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
          content: `${prompt}. Format the response in a ${format}. Provide keywords relevant to your response under a ## heading of "Keywords". Prepend each keyword with a #/hashtag`,
        },
      ],
    });

    if (response && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      const responseText = response.data.choices[0].message.content;
      const content = 
`
## Prompt: 
${prompt}
## Response: 
${responseText}
`;

      const markdownNotePath = `${process.env.LOCAL_STORAGE_PATH}${Date()}.md`;
      fs.writeFile(markdownNotePath, content, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error occurred while creating Markdown file");
        }
        console.log("Saved to csv and obsidian:", markdownNotePath);
        res.send(responseText);
      });
    } else {
      return res.status(500).send("Error occurred while generating a response");
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error occurred while calling the GPT-3 API");
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
