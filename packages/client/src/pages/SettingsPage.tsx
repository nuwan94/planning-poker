import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { Settings, Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserProfile {
  displayName: string;
  email: string;
  avatarUrl?: string;
}

const SettingsPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    email: '',
    avatarUrl: '',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
      return;
    }

    if (user) {
      // Load user profile from localStorage or initialize with Auth0 data
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      } else {
        // Initialize with user data from Auth0
        setProfile({
          displayName: user.name || '',
          email: user.email || '',
          avatarUrl: user.picture || '',
        });
      }
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('userProfile', JSON.stringify(profile));
      
      // Also update the planning poker user if name changed
      const savedUser = localStorage.getItem('planningPokerUser');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        userData.name = profile.displayName;
        userData.avatarUrl = profile.avatarUrl;
        localStorage.setItem('planningPokerUser', JSON.stringify(userData));
      }

      toast.success('Profile saved successfully!');
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfile = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="card p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-content max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg shadow-primary-500/25">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Settings</h1>
              <p className="text-slate-600 mt-1">Manage your profile</p>
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="card p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Profile Settings</h2>
            <p className="text-slate-600 text-sm">Update your personal information</p>
          </div>

          <div className="space-y-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={profile.displayName}
                onChange={(e) => updateProfile('displayName', e.target.value)}
                className="input w-full"
                placeholder="Enter your name"
              />
              <p className="text-xs text-slate-500 mt-1">
                This name will be shown to other users in planning poker rooms
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="input w-full bg-slate-50 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Avatar URL
              </label>
              <input
                type="url"
                value={profile.avatarUrl}
                onChange={(e) => updateProfile('avatarUrl', e.target.value)}
                className="input w-full"
                placeholder="https://example.com/avatar.jpg"
              />
              <p className="text-xs text-slate-500 mt-1">
                Enter a URL to a custom avatar image
              </p>
            </div>

            {profile.avatarUrl && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Avatar Preview
                </label>
                <img
                  src={profile.avatarUrl}
                  alt="Avatar preview"
                  className="w-20 h-20 rounded-full ring-4 ring-slate-100"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Save Button - Fixed at bottom */}
        {hasChanges && (
          <div className="fixed bottom-8 right-8 z-50">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary shadow-2xl hover:shadow-3xl flex items-center gap-2 px-6 py-3"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
