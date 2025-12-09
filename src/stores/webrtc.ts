import { create } from 'zustand';
import { useSettingsStore } from './settings';
import { Peer } from './peers';
import { useUIStore } from './ui';

export type Role = 'offerer' | 'answerer' | null;
export type MessageType = 'message' | 'avatar' | 'disconnect';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
  type: MessageType;
}

interface WebRTCState {
  peer: Peer | null;
  peerConnection: RTCPeerConnection | null;
  dataChannel: RTCDataChannel | null;
  offer: string;
  answer: string;
  role: Role;
  messages: Message[];
  collectedCandidates: string[];
  connectionState: RTCPeerConnectionState;
  iceGatheringState: RTCIceGatheringState;
  iceGatheringComplete: boolean;
  start: () => void;
  determineRole: () => void;
  createPeerConnection: () => void;
  createDataChannel: () => void;
  bindDataChannel: (channel: RTCDataChannel) => void;
  sendMessage: (text: string, type?: MessageType) => void;
  sendAvatar: () => void;
  addMessage: (message: Message) => void;
  generateOffer: () => Promise<void>;
  generateAnswer: () => Promise<void>;
  acceptOffer: (offer: string) => Promise<void>;
  acceptAnswer: (answer: string) => Promise<void>;
  disconnect: () => void;
}

interface PeerPayload {
  name: string;
  avatar?: string;
  desc: RTCSessionDescriptionInit | RTCSessionDescription;
}

const sameCandidates = (c1: string, c2: string) => {
  const ca1 = c1.split(' ')[0];
  const ca2 = c2.split(' ')[0];
  return ca1 === ca2;
}

const encodeDescription = (payload: PeerPayload) => {
  if (!payload.desc) {
    throw new Error('No session description to encode');
  }
  return btoa(JSON.stringify(payload));
};

const decodeDescription = (payload: string): PeerPayload => {
  try {
    return JSON.parse(atob(payload));
  } catch (error) {
    console.error('Failed to decode signaling payload:', error);
    throw new Error('Invalid signaling payload');
  }
};

export const useWebRTCStore = create<WebRTCState>((set, get) => ({
    peer: null,
    peerConnection: null,
    dataChannel: null,
    offer: '',
    answer: '',
    role: null,
    messages: [],
    collectedCandidates: [],
    connectionState: 'new',
    iceGatheringState: 'new',
    iceGatheringComplete: false,
    start: () => {
      if (get().peerConnection) {
        return;
      }
      get().determineRole();
      get().createPeerConnection();
    },
    determineRole: () => {
      // parse url params and check them for offer payload
      const urlParams = new URLSearchParams(window.location.search);
      const offer = urlParams.get('offer');
      if (offer) {
        set({ role: 'answerer', offer });
      } else {
        set({ role: 'offerer' });
      }
    },
    createPeerConnection: async () => {
      if (get().peerConnection) {
        return get().peerConnection;
      }
      const { stunServer, turnServer, turnUsername, turnPassword } = useSettingsStore.getState();

      const iceServers: RTCIceServer[] = [];

      if (stunServer?.trim()) {
        console.log("using stun server", stunServer);
        iceServers.push({ urls: stunServer.trim() });
      }

      if (turnServer?.trim()) {
        console.log("using turn server", turnServer);
        const turnConfig: RTCIceServer = { urls: turnServer.trim() };
        if (turnUsername?.trim()) {
          turnConfig.username = turnUsername.trim();
        }
        if (turnPassword?.trim()) {
          turnConfig.credential = turnPassword.trim();
        }
        iceServers.push(turnConfig);
      }
      console.log("creating connection", iceServers);
      const pc = new RTCPeerConnection({ iceServers });
      const finish = async () => {
        if (get().iceGatheringComplete) {
          console.log("already finished");
          return;
        }
        console.log("finishing connection");
        set({ iceGatheringComplete: true });
        const role = get().role;
          if (role === 'offerer') {
            await get().generateOffer();
            set({ offer: encodeDescription({ name: useSettingsStore.getState().name, desc: pc.localDescription! }) });
          } else if (role === 'answerer') {
            await get().acceptOffer(get().offer);
            set({ answer: encodeDescription({ name: useSettingsStore.getState().name, desc: pc.localDescription! }) });
          }
      }
      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          console.log("added ice candidate", event.candidate);
          const candidate = event.candidate.candidate;
          set((state) => ({ collectedCandidates: [...state.collectedCandidates.filter(c => !sameCandidates(c, candidate)), candidate] }));
          const collectedCandidates = get().collectedCandidates;
          console.log("collected candidates", collectedCandidates);
          const { stunServer, turnServer } = useSettingsStore.getState();
          const stunCollected = collectedCandidates.some(candidate => candidate.includes("srflx")) || !stunServer?.trim();
          const turnCollected = collectedCandidates.some(candidate => candidate.includes("relay")) || !turnServer?.trim();
          if (stunCollected && turnCollected) {
            await finish();
          }
        }
      };
      pc.onicegatheringstatechange = async () => {
        console.log('iceGatheringState', pc.iceGatheringState);
        set({ iceGatheringState: pc.iceGatheringState });
        if (pc.iceGatheringState === 'complete') {
          await finish();
        }
      };
      pc.ondatachannel = (event) => {
        get().bindDataChannel(event.channel);
        get().sendAvatar();
      };
      pc.onconnectionstatechange = () => {
        console.log('connectionState', pc.connectionState);
        if (pc.connectionState === 'connected') {
          useUIStore.getState().setScreen('chat');
        }
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          get().disconnect();
        }
        set({ connectionState: pc.connectionState });
      };
      pc.onnegotiationneeded = () => {
        console.log('negotiation needed');
        pc.setLocalDescription();
      };

      set({ peerConnection: pc });
      await get().createDataChannel();
      
      console.log("created connection", pc);
      return pc;
    },
    bindDataChannel: (channel: RTCDataChannel) => {
      const MESSAGE_CALLBACKS = {
        'avatar': (message: Message) => {
          set((state) => ({ peer: state.peer ? { ...state.peer, avatar: message.text } : null }));
        },
        'disconnect': () => {
          get().disconnect();
        },
        'message': (message: Message) => {
          get().addMessage({...message, isOwn: false});
        },
      }
      channel.onmessage = (event) => {
        const parsed = JSON.parse(event.data);
        parsed.timestamp = new Date(parsed.timestamp);
        const cb = MESSAGE_CALLBACKS[parsed.type as MessageType];
        if (!cb) {
          console.warn('Unknown message type', parsed.type);
          useUIStore.getState().showTooltip(`Unknown message type ${parsed.type}`);
          return;
        }
        cb(parsed);
      };
      set({ dataChannel: channel });
    },
    createDataChannel: () => {
      const pc = get().peerConnection;
      if (!pc) {
        throw new Error('No peer connection available');
      }
      const channel = pc.createDataChannel('chat', { ordered: true });
      get().bindDataChannel(channel);
      get().sendAvatar();
      return channel;
    },
    sendMessage: (text: string, type: MessageType = 'message') => {
      const { dataChannel } = get();
      if (!dataChannel || dataChannel.readyState !== 'open') {
        console.warn('Tried to send message while channel closed');
        return;
      }
      const message = {
        id: crypto.randomUUID(),
        text,
        timestamp: new Date(),
      };
      if (type === 'message') {
        get().addMessage({...message, isOwn: true, type});
      }
      dataChannel.send(JSON.stringify({...message, type}));
    },
    sendAvatar: () => {
      const avatar = useSettingsStore.getState().avatar;
      get().sendMessage(avatar, 'avatar');
    },
    addMessage: (message: Message) => {
      set((state) => ({ messages: [...state.messages, message] }));
    },
    generateOffer: async () => {
      const pc = get().peerConnection;
      if (!pc) {
        throw new Error('No peer connection available');
      }
      const offer = await pc.createOffer();
      console.log("generated offer", offer);
      await pc.setLocalDescription(offer);
      set({ offer: encodeDescription({ name: useSettingsStore.getState().name, avatar: useSettingsStore.getState().avatar, desc: pc.localDescription! }) });
    },
    generateAnswer: async () => {
      const pc = get().peerConnection;
      if (!pc) {
        throw new Error('No peer connection available');
      }
      const answer = await pc.createAnswer();
      console.log("generated answer", answer);
      await pc.setLocalDescription(answer);
      set({ answer: encodeDescription({ name: useSettingsStore.getState().name, avatar: useSettingsStore.getState().avatar, desc: pc.localDescription! }) });
    },
    acceptOffer: async (offer: string) => {
      const pc = get().peerConnection;
      if (!pc) {
        throw new Error('No peer connection available');
      }
      const description = decodeDescription(offer);
      set({ peer: { name: description.name, avatar: description.avatar, key: "" }, offer });
      await pc.setRemoteDescription(description.desc);
      await get().generateAnswer();
    },
    acceptAnswer: async (answer: string) => {
      const pc = get().peerConnection;
      if (!pc) {
        throw new Error('No peer connection available');
      }
      const description = decodeDescription(answer);
      set({ peer: { name: description.name, avatar: description.avatar, key: "" }, answer });
      await pc.setRemoteDescription(description.desc);
    },
    disconnect: () => {
      const pc = get().peerConnection;
      const dataChannel = get().dataChannel;
      if (dataChannel && dataChannel.readyState === 'open') {
        get().sendMessage('', 'disconnect');
      }
      if (pc) {
        pc.close();
      }
      if (get().role === 'answerer') {
        const url = new URL(window.location.href);
        url.searchParams.delete('offer');
        window.history.replaceState(null, '', url.toString());
      }
      useUIStore.getState().setScreen('connection');
      useUIStore.getState().showTooltip("Disconnected");
      set({ peerConnection: null, dataChannel: null, connectionState: 'closed', iceGatheringState: 'new', iceGatheringComplete: false, messages: [], role: null, offer: '', answer: '' });
    },
}))