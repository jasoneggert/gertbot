import { Configuration, OpenAIApi } from "openai";
import FormSection from "./components/FormSection";
import AnswerSection from "./components/AnswerSection";
import { useState } from "react";
import axios from "axios";

const App = () => {
  const configuration = new Configuration({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  const [storedValues, setStoredValues] = useState([]);
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [isGenerating, setIsGenerating] = useState(false);
  const generateResponse = async (newQuestion, setNewQuestion) => {
    setIsGenerating(true);
    const response = await openai.createChatCompletion({
      model: model,
      temperature: 0.5,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. And you append keywords relevantr to the content of the response to each response",
        },
        { role: "user", content: newQuestion },
      ],
    });
    console.log(response);
    setIsGenerating(false);
    if (response.data.choices) {
      setStoredValues([
        {
          question: newQuestion,
          answer: response.data.choices[0].message.content,
        },
        ...storedValues,
      ]);
      saveResponse({
        prompt: newQuestion,
        response: response.data.choices[0].message.content,
      });
      setNewQuestion("");
    }
  };

  const saveResponse = ({ prompt, response }) => {
    // Assuming you have a form with input fields for the data
    const formData = {
      prompt: prompt,
      response: response,
      date: new Date(),
    };
    console.log("formdata", formData);

    axios
      .post("http://localhost:3001/append-data", formData)
      .then((response) => {
        console.log(response.data); // Success message from the server
        // Perform any additional actions after successful data append
      })
      .catch((error) => {
        console.error(error);
        // Handle the error case
      });
  };

  return (
    <div>
      <div className="header-section">
        <h1>GertBot 🤖</h1>
      </div>
      <select
        className="model-select"
        onChange={(e) => setModel(e.target.value)}
      >
        <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
        <option value="gpt-4">gpt-4</option>
      </select>
      {!isGenerating && <FormSection generateResponse={generateResponse} />}
      {isGenerating && <h2>Generating</h2>}

      {storedValues.length > 0 && <AnswerSection storedValues={storedValues} />}
    </div>
  );
};

export default App;
