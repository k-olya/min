import { useWebRTCStore } from '../../stores/webrtc';
import { useEffect } from 'react';
import { OffererInstruction } from './offerer-instruction';
import { AnswererInstruction } from './answerer-instruction';
import { Loading } from './loading';

const ROLE_INSTRUCTIONS = {
  offerer: <OffererInstruction />,
  answerer: <AnswererInstruction />,
};

export const ConnectionScreen = () => {
  const { start, role } = useWebRTCStore();

  useEffect(() => {
    start();
  }, [start]);

  if (!role) {
    return <Loading />;
  }

  return ROLE_INSTRUCTIONS[role];
};