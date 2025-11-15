import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Check if this is a browser restore (performance.now() < 1000 means page loaded very quickly)
      const isBrowserRestore = performance.now() < 1000;
      
      if (isBrowserRestore) {
        console.log('Browser restore detected - clearing all data for safety');
        localStorage.clear();
        sessionStorage.clear();
        setIsLoading(false);
        return;
      }
      
      // Check if user is logged in from sessionStorage first (default behavior)
      // Only check localStorage if user explicitly chose "remember me"
      let savedUser = sessionStorage.getItem('user');
      let storageType = 'sessionStorage';
      
      // If no session data, check localStorage (for "remember me" users)
      if (!savedUser) {
        savedUser = localStorage.getItem('user');
        storageType = 'localStorage';
      }
      
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          
          // Check if token is expired (optional security check)
          if (userData.token) {
            // You can add token expiration check here
            // For now, we'll just load the user
            setUser(userData);
            console.log(`User auto-logged in from ${storageType}`);
          } else {
            // No token, clear invalid data
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('user');
          sessionStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Error in AuthContext useEffect:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          token: data.token
        };
        
        setUser(userData);
        
        // Use localStorage if rememberMe is true, otherwise use sessionStorage
        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('User data saved to localStorage (persistent)');
        } else {
          sessionStorage.setItem('user', JSON.stringify(userData));
          console.log('User data saved to sessionStorage (session only)');
        }
        
        return { success: true, user: userData };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Lỗi kết nối server' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    console.log('User logged out and data cleared from all storage');
  };

  const clearUserData = () => {
    setUser(null);
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    console.log('User data cleared from all storage');
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const register = async (email, password, name, phone, rememberMe = false) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, phone }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          token: data.token
        };
        
        setUser(userData);
        
        // Use localStorage if rememberMe is true, otherwise use sessionStorage
        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('User data saved to localStorage (persistent)');
        } else {
          sessionStorage.setItem('user', JSON.stringify(userData));
          console.log('User data saved to sessionStorage (session only)');
        }
        
        return { success: true, user: userData };
      } else {
        return { success: false, error: data.message || 'Đăng ký thất bại' };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Lỗi kết nối server' };
    }
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    clearUserData,
    isAdmin,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
