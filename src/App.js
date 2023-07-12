import FormSection from "./components/FormSection";
import AnswerSection from "./components/AnswerSection";
import { useState } from "react";
import axios from "axios";

const App = () => {
  const [storedValues, setStoredValues] = useState([]);
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [isGenerating, setIsGenerating] = useState(false);

  const talkToGertBot = async (prompt, setNewQuestion) => {
    setIsGenerating(true);

    try {
      const response = await axios.post("http://localhost:3001/generate", {
        prompt,
        model,
      });

      if (!response) {
        alert("No response returned");
        return;
      }

      setStoredValues([{ prompt, answer: response.data }, ...storedValues]);

      saveResponse({ prompt, response: response.data });
      setNewQuestion("");
    } catch (error) {
      console.error(error.message);
      alert("error generating response see console", error.message.reason);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveResponse = async ({ prompt, response }) => {
    const formData = {
      prompt,
      response,
      date: new Date(),
    };
    try {
      const response = await axios.post(
        "http://localhost:3001/write-file",
        formData
      );
      return response;
    } catch (error) {
      console.error(error.message);
      alert("error saving response walking tour see console", error.message.reason);
    }
  };

  return (
    <div>
      <div className="header-section">
        <h1>VernBot 🤖</h1>
      </div>

      <select
        className="model-select"
        onChange={(e) => setModel(e.target.value)}
      >
        <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
        <option value="gpt-4">gpt-4</option>
      </select>

      {!isGenerating && <FormSection generateResponse={talkToGertBot} />}
      {isGenerating && <h2>Generating</h2>}
      {storedValues.length > 0 && <AnswerSection storedValues={storedValues} />}
    </div>
  );
};

export default App;
