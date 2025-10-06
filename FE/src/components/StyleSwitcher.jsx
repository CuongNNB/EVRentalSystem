import React, { useState, useEffect } from 'react';
import { STYLES, applyStyle, getCurrentStyle, STYLE_DESCRIPTIONS } from '../utils/styleSwitcher';

export default function StyleSwitcher() {
  const [currentStyle, setCurrentStyle] = useState(getCurrentStyle());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    applyStyle(currentStyle);
  }, [currentStyle]);

  const handleStyleChange = (style) => {
    setCurrentStyle(style);
    applyStyle(style);
    setIsOpen(false);
  };

  return (
    <div className="style-switcher">
      <button 
        className="style-switcher-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Thay đổi phong cách nền"
      >
        <span className="style-emoji">{STYLE_DESCRIPTIONS[currentStyle].emoji}</span>
        <span className="style-name">{STYLE_DESCRIPTIONS[currentStyle].name}</span>
        <svg 
          className={`style-arrow ${isOpen ? 'open' : ''}`} 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="style-options">
          {Object.entries(STYLES).map(([key, value]) => (
            <button
              key={value}
              className={`style-option ${currentStyle === value ? 'active' : ''}`}
              onClick={() => handleStyleChange(value)}
            >
              <span className="option-emoji">{STYLE_DESCRIPTIONS[value].emoji}</span>
              <div className="option-content">
                <div className="option-name">{STYLE_DESCRIPTIONS[value].name}</div>
                <div className="option-description">{STYLE_DESCRIPTIONS[value].description}</div>
                <div className="option-advantages">{STYLE_DESCRIPTIONS[value].advantages}</div>
              </div>
              {currentStyle === value && (
                <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
