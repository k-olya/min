import { useState } from "react";
import { useWebRTCStore } from "../../stores/webrtc";

export const PasteBox = () => {
  const [answerInput, setAnswerInput] = useState("");

  const acceptAnswer = () => {
    if (answerInput.trim()) {
      useWebRTCStore.getState().acceptAnswer(answerInput.trim());
      setAnswerInput(""); // Clear after accepting
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        value={answerInput}
        onChange={(e) => setAnswerInput(e.target.value)}
        className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 h-20 text-xs"
        placeholder="Paste the answer code here"
      />
      <button
        onClick={acceptAnswer}
        className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        disabled={!answerInput.trim()}
      >
        Accept Answer
      </button>
    </div>
  );
};