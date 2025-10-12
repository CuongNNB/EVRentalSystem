import React, { useState, useRef, useEffect } from 'react';
import './GoogleMapsIframe.css';

const GoogleMapsIframe = ({ 
  src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1165.2492695919093!2d106.6915141845364!3d10.779411797641998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6678c2f1877db309%3A0xfb6bc68a2cae31af!2zTWFzc2FnZSBNaW5oIFTDom0gTMOqIFF1w70gxJDDtG4!5e0!3m2!1svi!2s!4v1760241934224!5m2!1svi!2s",
  className = "",
  title = "Bản đồ Google Maps",
  onLoad = null,
  onError = null,
  showLoading = true
}) => {
  const [loading, setLoading] = useState(showLoading);
  const [error, setError] = useState(false);
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      setLoading(false);
      setError(false);
      if (onLoad) onLoad();
    };
//hihi
    const handleError = () => {
      setLoading(false);
      setError(true);
      if (onError) onError();
    };

    // Set up event listeners
    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    // Timeout fallback
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError(true);
      }
    }, 10000); // 10 second timeout

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
      clearTimeout(timeout);
    };
  }, [loading, onLoad, onError]);

  const handleClick = (e) => {
    // Prevent click if iframe is not loaded
    if (loading || error) {
      e.preventDefault();
      return;
    }
    
    // Allow iframe to receive focus
    if (iframeRef.current) {
      iframeRef.current.focus();
    }
  };

  const containerClasses = [
    'map-container',
    loading ? 'loading' : '',
    error ? 'error' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      ref={containerRef}
      className={containerClasses}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={title}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e);
        }
      }}
    >
      {!error && (
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{
            border: 0,
            width: '100%',
            height: '100%',
            borderRadius: '12px'
          }}
        />
      )}
    </div>
  );
};

export default GoogleMapsIframe;
