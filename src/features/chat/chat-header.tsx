import { useState } from "react";
import { useWebRTCStore } from "../../stores/webrtc";
import { useSettingsStore } from "../../stores/settings";
import { FiMenu, FiUser, FiLogOut } from "react-icons/fi";

export const ChatHeader = () => {
  const { peer, disconnect } = useWebRTCStore();
  const { name } = useSettingsStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center relative">
      <div className="flex items-center space-x-3">
        {peer?.avatar ? (
          <img src={peer.avatar} alt="Peer Avatar" className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
            <FiUser size={16} className="text-gray-400" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold">{peer?.name || 'Peer'}</h1>
        </div>
      </div>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="text-gray-400 hover:text-white cursor-pointer"
        >
          <FiMenu size={20} />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg z-10">
            <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-600">
              Logged in as {name || 'Guest'}
            </div>
            <button
              onClick={() => {
                disconnect();
                setDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-600 flex items-center space-x-2 cursor-pointer"
            >
              <FiLogOut size={16} />
              <span>Disconnect</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
