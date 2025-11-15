import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import WelcomePopup from './components/WelcomePopup';
import UserSessionManager from './components/UserSessionManager';
import ContactButtons from './components/ContactButtons';
import Home from './pages/Home';
import Movies from './pages/Movies';
import RoomManagementPage from './pages/RoomManagement';
import MovieManagement from './pages/MovieManagement';
import ImageManagement from './pages/ImageManagement';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <div className="App">
              <ErrorBoundary>
                <UserSessionManager />
              </ErrorBoundary>
              <ErrorBoundary>
                <WelcomePopup />
              </ErrorBoundary>
              <ErrorBoundary>
                <Navbar />
              </ErrorBoundary>
              <main>
                <Routes>
                  <Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
                  <Route path="/movies" element={<ErrorBoundary><Movies /></ErrorBoundary>} />
                  <Route path="/rooms" element={<ErrorBoundary><RoomManagementPage /></ErrorBoundary>} />
                  <Route path="/admin/movies" element={<ErrorBoundary><MovieManagement /></ErrorBoundary>} />
                  <Route path="/admin/images" element={<ErrorBoundary><ImageManagement /></ErrorBoundary>} />
                </Routes>
              </main>
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
              <ErrorBoundary>
                <ContactButtons />
              </ErrorBoundary>
            </div>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
