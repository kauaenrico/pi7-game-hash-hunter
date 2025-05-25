import React from 'react';

interface GameStatusProps {
  level: number;
  hashes: number;
  totalHashes: number;
  status: string;
  time: string;
}

export const GameStatus: React.FC<GameStatusProps> = ({
  level,
  hashes,
  totalHashes,
  status,
  time
}) => {
  return (
    <div className="game-status">
      <div className="status-item">
        <span>Nível:</span>
        <span>{level}</span>
      </div>
      <div className="status-item">
        <span>Hashes:</span>
        <span>{hashes}/{totalHashes}</span>
      </div>
      <div className="status-item">
        <span>Status:</span>
        <span>{status}</span>
      </div>
      <div className="status-item">
        <span>Tempo:</span>
        <span>{time}</span>
      </div>
    </div>
  );
}; 