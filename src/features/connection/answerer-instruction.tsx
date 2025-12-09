import { CopyBox } from "./copy-box";
import { useWebRTCStore } from "../../stores/webrtc";
import { useSettingsStore } from "../../stores/settings";
import { useUIStore } from "../../stores/ui";
import { Loading } from "./loading";
import { FiSettings } from "react-icons/fi";
import { ServerStatus } from "./server-status";

export const AnswererInstruction = () => {
  const { answer, collectedCandidates } = useWebRTCStore();
  const { name, stunServer, turnServer } = useSettingsStore();
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Hello, {name || 'Guest'}!</h1>
        <button onClick={() => useUIStore.getState().setScreen('settings')} className="text-gray-400 hover:text-white">
          <FiSettings size={24} />
        </button>
      </div>
      <ServerStatus stunServer={stunServer} turnServer={turnServer} collectedCandidates={collectedCandidates} />
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-green-400 mb-2">1. Share this answer code with your friend</h2>
          <p className="text-gray-400 text-sm mb-2">Send the code below to complete the connection</p>
          {answer ? <CopyBox>{answer}</CopyBox> : <Loading />}
        </div>
      </div>
    </div>
  );
};