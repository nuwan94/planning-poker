import React from 'react';
import { Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import CreateRoomPage from './pages/CreateRoomPage';
import RoomPage from './pages/RoomPage';
import NotFoundPage from './pages/NotFoundPage';
import Layout from './components/Layout';
import { SocketProvider } from './contexts/SocketContext';

const App: React.FC = () => {
  return (
    <SocketProvider>
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create-room" element={<CreateRoomPage />} />
            <Route path="/room/:id" element={<RoomPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Layout>
    </SocketProvider>
  );
};

export default App;