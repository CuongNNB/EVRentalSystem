import React, { useRef, useState, useEffect } from 'react';
import './SignaturePad.css';

const SignaturePad = ({ onSignatureChange, isReadOnly = false, title, subtitle, isPreSigned = false }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureData, setSignatureData] = useState(null);

  useEffect(() => {
    if (isPreSigned) {
      // Tạo chữ ký mẫu cho bên A
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#0bb97f';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Vẽ chữ ký mẫu
      ctx.beginPath();
      ctx.moveTo(50, 80);
      ctx.quadraticCurveTo(80, 60, 120, 80);
      ctx.quadraticCurveTo(150, 100, 180, 80);
      ctx.quadraticCurveTo(200, 70, 220, 90);
      ctx.stroke();
      
      setHasSignature(true);
      setSignatureData(canvas.toDataURL());
    }
  }, [isPreSigned]);

  const startDrawing = (e) => {
    if (isReadOnly || isPreSigned) return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing || isReadOnly || isPreSigned) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL();
    setSignatureData(dataURL);
    setHasSignature(true);
    onSignatureChange(dataURL);
  };

  const clearSignature = () => {
    if (isReadOnly || isPreSigned) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setSignatureData(null);
    onSignatureChange(null);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    startDrawing(e);
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    draw(e);
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    stopDrawing();
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    startDrawing(mouseEvent);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    draw(mouseEvent);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    stopDrawing();
  };

  return (
    <div className="signature-pad-container">
      <div className="signature-header">
        <h3 className="signature-title">{title}</h3>
        <p className="signature-subtitle">{subtitle}</p>
      </div>
      
      <div className="signature-canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          className={`signature-canvas ${isReadOnly ? 'readonly' : ''} ${isPreSigned ? 'pre-signed' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={stopDrawing}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        
        {isPreSigned && (
          <div className="pre-signed-overlay">
            <span className="pre-signed-text">Chữ ký mẫu đã được ký sẵn</span>
          </div>
        )}
      </div>
      
      <div className="signature-actions">
        {hasSignature && !isPreSigned && (
          <div className="signature-status">
            <span className="status-text signed">✅ Đã ký</span>
            <button onClick={clearSignature} className="clear-btn">
              Ký lại
            </button>
          </div>
        )}
        
        {isPreSigned && (
          <div className="signature-status">
            <span className="status-text pre-signed">✅ Đã ký sẵn</span>
          </div>
        )}
        
        {!hasSignature && !isPreSigned && (
          <div className="signature-status">
            <span className="status-text pending">⏳ Chưa ký</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignaturePad;
