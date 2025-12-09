import { FiShare } from "react-icons/fi";
import { useUIStore } from "../../stores/ui";

export const CopyBox = ({ children }: { children: string }) => {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      useUIStore.getState().showTooltip("Copied!");
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const shareContent = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'WebRTC Chat Invitation',
          text: 'Join my WebRTC chat session',
          url: children,
        });
      } catch (error) {
        // User cancelled or share failed, fallback to copy
        if (error instanceof Error && error.name !== 'AbortError') {
          await copyToClipboard();
        }
      }
    } else {
      // Fallback to copy if share not supported
      await copyToClipboard();
    }
  };

  return (
    <div className="flex items-center justify-between p-2 border border-gray-600 rounded bg-gray-700 text-white">
      <span
        className="flex-1 font-mono text-xs break-all cursor-pointer hover:bg-gray-600 rounded px-1 py-0.5"
        onClick={copyToClipboard}
        title="Click to copy"
      >
        {children}
      </span>
      <button
        onClick={shareContent}
        className="text-gray-400 hover:text-white ml-2 cursor-pointer"
        title="Share"
      >
        <FiShare className="size-6" />
      </button>
    </div>
  );
};