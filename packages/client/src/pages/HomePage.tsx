import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import toast from 'react-hot-toast';

import { generateId } from '@planning-poker/shared';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');

  const handleCreateRoom = () => {
    if (!roomName.trim()) {
      toast.error('Please enter a room name');
      return;
    }
    if (!userName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    const roomId = generateId();
    // Store user name in localStorage for the room
    localStorage.setItem('planningPokerUser', JSON.stringify({
      name: userName.trim(),
      id: generateId()
    }));
    
    toast.success('Room created successfully!');
    navigate(`/room/${roomId}`);
  };

  const handleJoinRoom = () => {
    if (!joinRoomId.trim()) {
      toast.error('Please enter a room ID');
      return;
    }
    if (!userName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    // Store user name in localStorage for the room
    localStorage.setItem('planningPokerUser', JSON.stringify({
      name: userName.trim(),
      id: generateId()
    }));
    
    navigate(`/room/${joinRoomId.trim()}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-primary-700 mb-4">
          🎯 Planning Poker
        </h1>
        <h2 className="text-2xl text-gray-600 mb-4">
          Estimate your stories with your team in real-time
        </h2>
        <p className="text-lg text-gray-500">
          A collaborative tool for agile estimation using story points
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Create Room Card */}
        <div className="card p-8 h-full">
          <div className="flex items-center mb-6">
            <Plus className="text-primary-600 mr-3" size={28} />
            <h3 className="text-2xl font-bold text-gray-800">
              Create New Room
            </h3>
          </div>
          
          <form className="space-y-6">
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                id="userName"
                type="text"
                className="input-field"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-2">
                Room Name
              </label>
              <input
                id="roomName"
                type="text"
                className="input-field"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g., Sprint 23 Planning"
              />
            </div>
            <button
              type="button"
              onClick={handleCreateRoom}
              className="btn-primary w-full flex items-center justify-center py-3"
            >
              <Plus className="mr-2" size={20} />
              Create Room
            </button>
          </form>
        </div>

        {/* Join Room Card */}
        <div className="card p-8 h-full">
          <div className="flex items-center mb-6">
            <Users className="text-primary-600 mr-3" size={28} />
            <h3 className="text-2xl font-bold text-gray-800">
              Join Existing Room
            </h3>
          </div>
          
          <form className="space-y-6">
            <div>
              <label htmlFor="userNameJoin" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                id="userNameJoin"
                type="text"
                className="input-field"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-2">
                Room ID
              </label>
              <input
                id="roomId"
                type="text"
                className="input-field"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                placeholder="Enter room ID"
              />
            </div>
            <button
              type="button"
              onClick={handleJoinRoom}
              className="btn-secondary w-full flex items-center justify-center py-3"
            >
              <Users className="mr-2" size={20} />
              Join Room
            </button>
          </form>
        </div>
      </div>

      {/* Card Preview Section */}
      <div className="bg-white rounded-xl p-8 mb-8 border border-gray-200">
        <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Planning Poker Cards Preview
        </h3>
        <div className="flex justify-center items-center space-x-4 mb-8">
          {['1', '2', '3', '5', '8', '13', '?', '☕'].map((value, index) => (
            <div
              key={value}
              className={`planning-poker-card w-16 h-24 flex items-center justify-center text-xl font-bold ${
                index === 2 ? 'selected' : ''
              }`}
            >
              {value}
            </div>
          ))}
        </div>
        <p className="text-center text-gray-600">
          Click on a card to select your estimate
        </p>
      </div>

      {/* Features Section */}
      <div className="bg-gray-100 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Features
        </h3>
        <div className="w-24 h-0.5 bg-primary-600 mx-auto mb-8"></div>
        <div className="grid sm:grid-cols-3 gap-8">
          <div className="text-center">
            <h4 className="text-xl font-semibold text-gray-800 mb-2">🎯 Real-time Voting</h4>
            <p className="text-gray-600">
              Vote on stories simultaneously with your team members
            </p>
          </div>
          <div className="text-center">
            <h4 className="text-xl font-semibold text-gray-800 mb-2">📊 Multiple Card Decks</h4>
            <p className="text-gray-600">
              Choose from Fibonacci, T-shirt sizes, and custom decks
            </p>
          </div>
          <div className="text-center">
            <h4 className="text-xl font-semibold text-gray-800 mb-2">👥 Team Collaboration</h4>
            <p className="text-gray-600">
              See who has voted and reveal results together
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;