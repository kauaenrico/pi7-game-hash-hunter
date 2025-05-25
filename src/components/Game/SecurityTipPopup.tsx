import React from 'react';

interface SecurityTipPopupProps {
  show: boolean;
  tip: string;
  onClose: () => void;
}

export const SecurityTipPopup: React.FC<SecurityTipPopupProps> = ({
  show,
  tip,
  onClose
}) => {
  if (!show) return null;

  return (
    <div id="securityTipPopup" className="security-tip-popup">
      <span className="tip-icon">🛡️</span>
      <span className="tip-content">{tip}</span>
      <button className="continue-button" onClick={onClose}>
        CONTINUAR
      </button>
    </div>
  );
}; 