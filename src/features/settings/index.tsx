import { useSettingsStore } from '../../stores/settings';
import { useUIStore } from '../../stores/ui';
import { useState, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import { resizeImage } from '../../util/image-resize';

export const SettingsScreen = () => {
  const {
    name,
    avatar,
    stunServer,
    turnServer,
    turnUsername,
    turnPassword,
    setSettings,
    resetToDefaults,
  } = useSettingsStore();

  const { setScreen } = useUIStore();

  const [localName, setLocalName] = useState(name);
  const [localAvatar, setLocalAvatar] = useState(avatar);
  const [localStun, setLocalStun] = useState(stunServer);
  const [localTurn, setLocalTurn] = useState(turnServer);
  const [localUsername, setLocalUsername] = useState(turnUsername);
  const [localPassword, setLocalPassword] = useState(turnPassword);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const resized = await resizeImage(base64);
          setLocalAvatar(resized);
        } catch (error) {
          console.error('Failed to resize image:', error);
          setLocalAvatar(base64); // fallback
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSettings(localName, localAvatar, localStun, localTurn, localUsername, localPassword);
    setScreen('connection');
  };

  const handleReset = () => {
    resetToDefaults();
    setLocalName(name);
    setLocalAvatar('');
    setLocalStun('stun:stun.l.google.com:19302');
    setLocalTurn('');
    setLocalUsername('');
    setLocalPassword('');
  };

  return (<>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <button
            onClick={() => setScreen('connection')}
            className="text-gray-400 hover:text-white cursor-pointer"
          >
            <FiX />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Your Name</label>
            <input
              type="text"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Avatar</label>
            {localAvatar && <img src={localAvatar} alt="Avatar" className="w-16 h-16 rounded-full mb-2" />}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 cursor-pointer"
            >
              Choose Avatar
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">STUN Server</label>
            <input
              type="text"
              value={localStun}
              onChange={(e) => setLocalStun(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400"
              placeholder="stun:stun.l.google.com:19302"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">TURN Server</label>
            <input
              type="text"
              value={localTurn}
              onChange={(e) => setLocalTurn(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400"
              placeholder="turn:example.com:3478"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">TURN Username</label>
            <input
              type="text"
              value={localUsername}
              onChange={(e) => setLocalUsername(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">TURN Password</label>
            <input
              type="password"
              value={localPassword}
              onChange={(e) => setLocalPassword(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
          >
            Save
          </button>
          <button
            onClick={handleReset}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 cursor-pointer"
          >
            Reset
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-400">
          Settings are automatically saved to local storage.
        </div>
        </>
  );
};
