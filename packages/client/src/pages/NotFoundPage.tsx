import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '../components/Button';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="py-16 text-center">
      <h1 className="text-9xl font-bold text-gray-300 mb-4">
        404
      </h1>
      <h2 className="text-4xl font-bold text-gray-800 mb-4">
        Page Not Found
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        The page you're looking for doesn't exist.
      </p>
      <Button
        onClick={() => navigate('/')}
        className="flex items-center justify-center mx-auto text-lg px-6 py-3"
      >
        <Home className="mr-2" size={20} />
        Go Home
      </Button>
    </div>
  );
};

export default NotFoundPage;