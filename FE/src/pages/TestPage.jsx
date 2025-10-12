import React from 'react';

const TestPage = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        ✅ Test Page - React đang hoạt động!
      </h1>
      <p style={{ color: '#666', fontSize: '18px' }}>
        Nếu bạn thấy trang này, có nghĩa là React đã load thành công.
      </p>
      <div style={{ 
        marginTop: '20px', 
        padding: '10px 20px', 
        backgroundColor: '#4CAF50', 
        color: 'white', 
        borderRadius: '5px' 
      }}>
        Server đang chạy bình thường
      </div>
    </div>
  );
};

export default TestPage;
