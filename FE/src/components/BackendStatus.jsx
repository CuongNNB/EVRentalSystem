import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../config/api';
import { getApiService } from '../services/mockApi';

const BackendStatus = () => {
  const [isOnline, setIsOnline] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const [apiMode, setApiMode] = useState('real');

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    setIsChecking(true);
    try {
      const mode = await getApiService();
      setApiMode(mode);
      setIsOnline(mode === 'real');
    } catch (error) {
      console.warn('Backend status check failed:', error);
      setIsOnline(false);
      setApiMode('mock');
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        padding: '8px 12px',
        backgroundColor: '#fbbf24',
        color: 'white',
        borderRadius: '6px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        🔄 Đang kiểm tra kết nối...
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        padding: '8px 12px',
        backgroundColor: '#f59e0b',
        color: 'white',
        borderRadius: '6px',
        fontSize: '12px',
        zIndex: 1000,
        cursor: 'pointer'
      }}
      onClick={checkBackendStatus}
      title="Click để kiểm tra lại"
      >
        🔄 Mock Mode - Click để thử backend
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      padding: '8px 12px',
      backgroundColor: '#10b981',
      color: 'white',
      borderRadius: '6px',
      fontSize: '12px',
      zIndex: 1000
    }}>
      ✅ Backend online
    </div>
  );
};

export default BackendStatus;
