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
app.post("/generate", async (req, res) => {
  console.log("starting response generation");
  const prompt = req.body.prompt;
  const model = req.body.model;
  const response = await openai.createChatCompletion({
    model: model,
    temperature: 0.5,
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant focused on assistanting with code, product managment, writing, and art",
          
      },
      {
        role: "system",
        content:
        " Respond in markdown append keywords relevant to your response to the end of your response prepending each key word with a # symbol",
          
      },
      { role: "user", content: prompt },
    ],
  });
  console.log("openai comm succesful");
  if (response) {
    res.send(response.data.choices[0].message.content);
  } else {

    res.status(500).send("Error occurred while generating response");
  }
});

app.post("/write-file", (req, res) => {
  const newData = req?.body; 
  const prompt = newData?.prompt;
  const response = newData?.response;
  const date = newData?.date;
  const truncateString =(str, num) => {
    if (str?.length <= num) {
      return str
    }
    return str.slice(0, num)
  }
  const content =`date: ${truncateString(date, 9)}
  prompt: ${prompt}
  response: ${response}
  `
const markdownNotePath = `${process.env.LOCAL_STORAGE_PATH}${truncateString(prompt, 44)}.md`;
  fs.writeFile(markdownNotePath, content, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error occurred while creating Markdown file");
    } else {
      console.log("saved to csv and obsidian")
      res.send("saved to csv and obsidian");
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
