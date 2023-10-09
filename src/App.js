import FormSection from "./components/FormSection";
import AnswerSection from "./components/AnswerSection";
import { useState } from "react";
import axios from "axios";
const App = () => {
  const [storedValues, setStoredValues] = useState([]);
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [format, setFormat] = useState("markdown");

  const [isGenerating, setIsGenerating] = useState(false);

/**
 * Sends a request to the GertBot API to generate a response based on the given prompt.
 * Updates the stored values with the new prompt and response.
 * Saves the response to a database.
 * Clears the new question input.
 * Shows an alert if there is an error generating the response.
 *
 * @param {string} prompt - The prompt to generate a response for.
 * @param {Function} setNewQuestion - The function to clear the new question input.
 */

  const talkToGertBot = async (prompt, setNewQuestion) => {
    setIsGenerating(true);

    try {
      // Send a POST request to the GertBot API
      const response = await axios.post("http://localhost:3001/generate", {
        prompt,
        model,
        format
      });

      if (!response) {
        // Show an alert if no response is returned
        alert("No response returned");
        return;
      }

      setStoredValues([{ prompt, answer: response.data }, ...storedValues]);
      setNewQuestion("");
    } catch (error) {
      console.error(error.message);
      alert("error generating response see console", error.message.reason);
    } finally {
      setIsGenerating(false);
    }
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

      <select
        className="format-select"
        onChange={(e) => setFormat(e.target.value)}
      >
        <option value="markdown">markdown</option>
        <option value="rich text">rich text</option>
        <option value="html">html</option>
      </select>
      {!isGenerating && <FormSection generateResponse={talkToGertBot} />}
      {isGenerating && <h2>Generating</h2>}
      {storedValues.length > 0 && <AnswerSection storedValues={storedValues} />}
    </div>
  );
};

export default App;
