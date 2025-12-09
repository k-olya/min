import { useWebRTCStore } from '../../stores/webrtc';
import { useState } from 'react';
import { ChatHeader } from './chat-header';
import { FiSend } from 'react-icons/fi';

export const ChatScreen = () => {
  const {
    messages,
    collectedCandidates,
    sendMessage,
  } = useWebRTCStore();

  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  return (
    <div className="h-full bg-gray-900 text-white flex flex-col">
      <ChatHeader />

      {/* Messages Area - Takes remaining space */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.isOwn ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
              }`}>
                <p className="text-sm">{msg.text}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-gray-800 border-t border-gray-700 pt-4 px-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 p-2 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
          >
            <FiSend />
          </button>
        </div>
      </div>

    </div>
  );
};
