import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { Settings, User, Bell, Eye, Palette, Save, ArrowLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserSettings {
  displayName: string;
  email: string;
  avatarUrl?: string;
  notifications: {
    votingStarted: boolean;
    votingEnded: boolean;
    userJoined: boolean;
    storyCreated: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    cardDeckPreference: 'fibonacci' | 'modified-fibonacci' | 't-shirt' | 'powers-of-2';
  };
  privacy: {
    showOnlineStatus: boolean;
    showVotingHistory: boolean;
  };
}

const SettingsPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'appearance' | 'privacy'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [settings, setSettings] = useState<UserSettings>({
    displayName: '',
    email: '',
    avatarUrl: '',
    notifications: {
      votingStarted: true,
      votingEnded: true,
      userJoined: false,
      storyCreated: true,
    },
    appearance: {
      theme: 'light',
      cardDeckPreference: 'fibonacci',
    },
    privacy: {
      showOnlineStatus: true,
      showVotingHistory: true,
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
      return;
    }

    if (user) {
      // Load user settings from localStorage or API
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      } else {
        // Initialize with user data from Auth0
        setSettings(prev => ({
          ...prev,
          displayName: user.name || '',
          email: user.email || '',
          avatarUrl: user.picture || '',
        }));
      }
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage (in production, this would be an API call)
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      // Also update the planning poker user if name changed
      const savedUser = localStorage.getItem('planningPokerUser');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        userData.name = settings.displayName;
        userData.avatarUrl = settings.avatarUrl;
        localStorage.setItem('planningPokerUser', JSON.stringify(userData));
      }

      toast.success('Settings saved successfully!');
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSettings = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K] | Partial<UserSettings[K]>
  ) => {
    setSettings(prev => {
      const prevValue = prev[key];
      if (typeof value === 'object' && !Array.isArray(value) && value !== null && typeof prevValue === 'object' && !Array.isArray(prevValue) && prevValue !== null) {
        return {
          ...prev,
          [key]: { ...prevValue, ...value },
        };
      }
      return {
        ...prev,
        [key]: value,
      };
    });
    setHasChanges(true);
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
    { id: 'privacy' as const, label: 'Privacy', icon: Eye },
  ];

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
      <div className="page-content max-w-5xl mx-auto">
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
              <p className="text-slate-600 mt-1">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <div className="col-span-12 md:col-span-3">
            <nav className="card p-2 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="col-span-12 md:col-span-9">
            <div className="card p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Profile Settings</h2>
                    <p className="text-slate-600 text-sm">Update your personal information</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={settings.displayName}
                        onChange={(e) => updateSettings('displayName', e.target.value)}
                        className="input w-full"
                        placeholder="Enter your name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={settings.email}
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
                        value={settings.avatarUrl}
                        onChange={(e) => updateSettings('avatarUrl', e.target.value)}
                        className="input w-full"
                        placeholder="https://example.com/avatar.jpg"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Enter a URL to a custom avatar image
                      </p>
                    </div>

                    {settings.avatarUrl && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Avatar Preview
                        </label>
                        <img
                          src={settings.avatarUrl}
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
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Notification Preferences</h2>
                    <p className="text-slate-600 text-sm">Choose what notifications you want to receive</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-slate-900">Voting Started</h3>
                        <p className="text-sm text-slate-600">Get notified when voting begins</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.votingStarted}
                          onChange={(e) =>
                            updateSettings('notifications', { votingStarted: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-slate-900">Voting Ended</h3>
                        <p className="text-sm text-slate-600">Get notified when voting ends</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.votingEnded}
                          onChange={(e) =>
                            updateSettings('notifications', { votingEnded: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-slate-900">User Joined</h3>
                        <p className="text-sm text-slate-600">Get notified when someone joins a room</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.userJoined}
                          onChange={(e) =>
                            updateSettings('notifications', { userJoined: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-slate-900">Story Created</h3>
                        <p className="text-sm text-slate-600">Get notified when a new story is created</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.storyCreated}
                          onChange={(e) =>
                            updateSettings('notifications', { storyCreated: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Appearance Settings</h2>
                    <p className="text-slate-600 text-sm">Customize how Planning Poker looks</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['light', 'dark', 'system'].map((theme) => (
                          <button
                            key={theme}
                            onClick={() =>
                              updateSettings('appearance', {
                                theme: theme as 'light' | 'dark' | 'system',
                              })
                            }
                            className={`p-4 rounded-lg border-2 transition-all capitalize ${
                              settings.appearance.theme === theme
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {settings.appearance.theme === theme && (
                              <Check className="w-5 h-5 text-primary-600 mb-2 mx-auto" />
                            )}
                            {theme}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Dark theme coming soon
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">
                        Default Card Deck
                      </label>
                      <select
                        value={settings.appearance.cardDeckPreference}
                        onChange={(e) =>
                          updateSettings('appearance', {
                            cardDeckPreference: e.target.value as any,
                          })
                        }
                        className="input w-full"
                      >
                        <option value="fibonacci">Fibonacci (0, 1, 2, 3, 5, 8, 13, 21)</option>
                        <option value="modified-fibonacci">Modified Fibonacci (0, 1, 2, 3, 5, 8, 13, 20, 40)</option>
                        <option value="t-shirt">T-Shirt Sizes (XS, S, M, L, XL, XXL)</option>
                        <option value="powers-of-2">Powers of 2 (0, 1, 2, 4, 8, 16, 32)</option>
                      </select>
                      <p className="text-xs text-slate-500 mt-2">
                        This will be the default deck when creating new rooms
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Privacy Settings</h2>
                    <p className="text-slate-600 text-sm">Control your privacy and data</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-slate-900">Show Online Status</h3>
                        <p className="text-sm text-slate-600">
                          Let others see when you're online in rooms
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.privacy.showOnlineStatus}
                          onChange={(e) =>
                            updateSettings('privacy', { showOnlineStatus: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-slate-900">Show Voting History</h3>
                        <p className="text-sm text-slate-600">
                          Display your voting history in room analytics
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.privacy.showVotingHistory}
                          onChange={(e) =>
                            updateSettings('privacy', { showVotingHistory: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <h3 className="font-medium text-slate-900 mb-2">Data Management</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Manage your data and account
                    </p>
                    <button className="btn-secondary text-red-600 border-red-300 hover:bg-red-50">
                      Delete Account
                    </button>
                  </div>
                </div>
              )}
            </div>
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
