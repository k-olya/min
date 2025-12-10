import { useEffect } from "react";
import { useWebRTCStore } from "../../stores/webrtc";

export const TabState = () => {
    // bind tab activation/deactivation events
    useEffect(() => {
        const sendMessage = useWebRTCStore.getState().sendMessage;
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                sendMessage('true', 'tab');
            } else {
                sendMessage('false', 'tab');
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        // Send initial state
        handleVisibilityChange();
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);
    return null;
};