import React from 'react';
import { Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import RoomPage from './pages/RoomPage';
import NotFoundPage from './pages/NotFoundPage';
import { SocketProvider } from './contexts/SocketContext';

const App: React.FC = () => {
  return (
    <SocketProvider>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </SocketProvider>
  );
};

export default App;