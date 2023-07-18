const express = require("express");
const fs = require("fs");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const { Configuration, OpenAIApi } = require("openai");
const port = 3001;
// Allow all CORS requests
app.use(cors());
// Configure body-parser middleware for parsing application/json
app.use(bodyParser.json());
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
require("dotenv").config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
// Generate Response

const replaceWords = (str) => {
  return str
    .replace(/Vault Platform/g, "Platform")
    .replace(/Veeva/g, "Life-science software company")
    .replace(/Vault/g, "Application");
};
app.post("/generate", async (req, res) => {
  console.log("starting response generation");
  const prompt = replaceWords(req.body.prompt);
  const model = req.body.model;
  const response = await openai.createChatCompletion({
    model: model,
    temperature: 0.5,
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant focused on assistanting with code, product managment documents, and general business writing for a large software compnay",
      },
      {
        role: "user",
        content: `${prompt} Provide the response in a JSON object format. The empty JSON object will look like this {prompt: "", response: "", keywords: ""} Provide a summary of the prompt as the value for the JSON object attribute "prompt" as a string.  Provide your response as a value for the JSON object attribute "response". Format the response content using markdown. Provide keywords relevant to your response as a value for the JSON object attribute "keywords". Prepend each key word with a #/hastag`,
      },
    ],
  });
  console.log("openai comm succesful");
  if (response) {
    res.send(response.data.choices[0].message.content);
    try {
      const newData = response.data.choices[0].message.content;
      console.log('newdata', newData)
      const prompt = newData?.prompt;
      const responseText = newData?.response;
      const keywords = newData?.keywords;
      const date = Date();
      
      const content = 
    `## Date:
    ${date}
    ## Prompt: 
    ${prompt}
    ## Response: 
    ${responseText}
    ## Keywords
    ${keywords}
    `;
    console.log('cont', content)
      const markdownNotePath = `${process.env.LOCAL_STORAGE_PATH}${prompt}.md`;
      fs.writeFile(markdownNotePath, content, (err) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error occurred while creating Markdown file");
        } else {
          console.log(markdownNotePath)
          console.log("saved to csv and obsidian");
        }
      });
    } catch {
      res.status(500).send("Error occurred while generating doc");
    }
  } else {
    res.status(500).send("Error occurred while calling gpt");
  }
});

app.post("/write-file", (req, res) => {
 
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
