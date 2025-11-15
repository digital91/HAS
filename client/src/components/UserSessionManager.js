import React from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const UserSessionManager = () => {
  const { user, clearUserData, logout } = useAuth();

  const handleClearSession = () => {
    if (window.confirm('Bạn có chắc muốn xóa dữ liệu đăng nhập? Bạn sẽ phải đăng nhập lại.')) {
      clearUserData();
      toast.success('Đã xóa dữ liệu đăng nhập');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      logout();
      toast.success('Đã đăng xuất');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <div><strong>Đăng nhập:</strong> {user.name} ({user.role})</div>
      <div style={{ marginTop: '5px' }}>
        <button 
          onClick={handleLogout}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '2px 8px',
            borderRadius: '3px',
            marginRight: '5px',
            cursor: 'pointer'
          }}
        >
          Đăng xuất
        </button>
        <button 
          onClick={handleClearSession}
          style={{
            background: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '2px 8px',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Xóa session
        </button>
      </div>
    </div>
  );
};

export default UserSessionManager;
