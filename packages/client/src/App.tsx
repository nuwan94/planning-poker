import React from 'react';
import { Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import CreateRoomPage from './pages/CreateRoomPage';
import RoomPage from './pages/RoomPage';
import MyRoomsPage from './pages/MyRoomsPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import Layout from './components/Layout';
import { SocketProvider } from './contexts/SocketContext';
import Auth0ProviderWithConfig from './auth/Auth0ProviderWithConfig';

const App: React.FC = () => {
  return (
    <Auth0ProviderWithConfig>
      <SocketProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create-room" element={<CreateRoomPage />} />
            <Route path="/my-rooms" element={<MyRoomsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/room/:id" element={<RoomPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </SocketProvider>
    </Auth0ProviderWithConfig>
  );
};

export default App;