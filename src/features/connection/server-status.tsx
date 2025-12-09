import { FiCircle } from "react-icons/fi";
import { FaCircle } from "react-icons/fa";

interface ServerStatusProps {
  stunServer?: string;
  turnServer?: string;
  collectedCandidates: string[];
}

export const ServerStatus = ({ stunServer, turnServer, collectedCandidates }: ServerStatusProps) => {
  const isServerCollected = (server?: string) => {
    if (!server) return false;
    return collectedCandidates.some(candidate => candidate.includes(server));
  };

  const stunCollected = collectedCandidates.some(candidate => candidate.includes("srflx"));
  const turnCollected = collectedCandidates.some(candidate => candidate.includes("relay"));

  return (
    <div>
      <p className="text-gray-400 mb-2">Configured servers:</p>
      <ul className="space-y-1">
        {stunServer && (
          <li className={`flex items-center text-green-400 ${!stunCollected ? 'animate-pulse' : ''}`}>
            {stunCollected ? <FaCircle className="mr-2" size={12} /> : <FiCircle className="mr-2" size={12} />}
            STUN: {stunServer}
          </li>
        )}
        {turnServer && (
          <li className={`flex items-center text-green-400 ${!turnCollected ? 'animate-pulse' : ''}`}>
            {turnCollected ? <FaCircle className="mr-2" size={12} /> : <FiCircle className="mr-2" size={12} />}
            TURN: {turnServer}
          </li>
        )}
      </ul>
    </div>
  );
};
