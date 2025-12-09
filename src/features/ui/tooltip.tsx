import { useUIStore } from "../../stores/ui";

export const Tooltip = () => {
  const { tooltipMessage } = useUIStore();

  if (!tooltipMessage) return null;

  return (
    <>
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .progress-bar {
          animation: shrink 2s linear forwards;
        }
      `}</style>
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm px-3 py-2 rounded shadow-lg z-50 min-w-24 text-center">
        {tooltipMessage}
        <div className="absolute bottom-0 left-0 h-1 bg-green-500 rounded-b progress-bar" />
      </div>
    </>
  );
};
