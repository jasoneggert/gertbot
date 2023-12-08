import React from "react";
import Markdown from "react-markdown";

const AnswerSection = ({ storedValues }) => {
  const copyText = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      <hr className="hr-line" />
      <div className="answer-container">
        {storedValues.map((value, index) => {
          return (
            <div className="answer-section" key={index}>
              <div className="question">{value.question}</div>

              <p className="answer">
                <Markdown>{value.answer}</Markdown>
              </p>
              <div className="copy-icon" onClick={() => copyText(value.answer)}>
                <i className="fa-solid fa-copy"></i>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default AnswerSection;
