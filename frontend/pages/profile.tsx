import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useGestures } from '../hooks/useGestures';
import { 
  User,
  Mail,
  Github,
  Shield,
  Key,
  Settings,
  Save,
  Eye,
  EyeOff,
  Copy,
  Trash2
} from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('profile');
  const [apiKeys, setApiKeys] = useState([
    { id: '1', name: 'Development Key', key: 'dcp_live_abc123...', created: '2025-01-15', lastUsed: '2025-01-16' },
    { id: '2', name: 'Production Key', key: 'dcp_live_xyz789...', created: '2025-01-10', lastUsed: '2025-01-16' }
  ]);
  const [showKeys, setShowKeys] = useState<{[key: string]: boolean}>({});
  const [newKeyName, setNewKeyName] = useState('');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'api-keys', label: 'API Keys', icon: <Key className="w-4 h-4" /> },
    { id: 'preferences', label: 'Preferences', icon: <Settings className="w-4 h-4" /> }
  ];

  // Gesture support for tab navigation
  const { gestureHandlers } = useGestures({
    onSwipeLeft: () => {
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1].id);
      }
    },
    onSwipeRight: () => {
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
      if (currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1].id);
      }
    },
    threshold: 100
  });

  // Apply gesture handlers to tab content
  useEffect(() => {
    const tabContent = document.querySelector('.profile-tab-content');
    if (tabContent) {
      tabContent.addEventListener('touchstart', gestureHandlers.onTouchStart);
      tabContent.addEventListener('touchmove', gestureHandlers.onTouchMove);
      tabContent.addEventListener('touchend', gestureHandlers.onTouchEnd);

      return () => {
        tabContent.removeEventListener('touchstart', gestureHandlers.onTouchStart);
        tabContent.removeEventListener('touchmove', gestureHandlers.onTouchMove);
        tabContent.removeEventListener('touchend', gestureHandlers.onTouchEnd);
      };
    }
  }, [gestureHandlers]);

  // Helper function to generate a secure random string
  function generateSecureApiKey(length = 20) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    // Convert to base64 for compactness and readability
    return btoa(String.fromCharCode(...array)).replace(/[^a-zA-Z0-9]/g, '').substr(0, length);
  }

  const handleGenerateApiKey = () => {
    if (!newKeyName.trim()) return;
    
    const newKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `dcp_live_${generateSecureApiKey(20)}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never'
    };
    
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
    
    addNotification({
      type: 'success',
      title: 'API Key Generated',
      message: `New API key "${newKeyName}" has been created successfully.`
    });
  };

  const handleDeleteApiKey = (keyId: string) => {
    const keyToDelete = apiKeys.find(key => key.id === keyId);
    setApiKeys(apiKeys.filter(key => key.id !== keyId));
    
    addNotification({
      type: 'info',
      title: 'API Key Deleted',
      message: `API key "${keyToDelete?.name}" has been deleted.`
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addNotification({
        type: 'success',
        title: 'Copied to Clipboard',
        message: 'API key has been copied to your clipboard.'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Copy Failed',
        message: 'Failed to copy API key to clipboard. Please try again.'
      });
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="profile-page">
          <div className="container">
            <div className="profile-header">
              <div className="profile-avatar">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="avatar-image" />
                ) : (
                  <User className="w-12 h-12" />
                )}
              </div>
              <div className="profile-info">
                <h1 className="profile-name">{user?.name || user?.username}</h1>
                <p className="profile-username">@{user?.username}</p>
                <p className="profile-email">{user?.email}</p>
              </div>
            </div>

            <div className="profile-content">
              <div className="profile-tabs">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="profile-tab-content">
                {activeTab === 'profile' && (
                  <div className="tab-panel">
                    <h2 className="tab-title">Profile Information</h2>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">
                          <User className="w-4 h-4" />
                          Full Name
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={user?.name || ''}
                          placeholder="Enter your full name"
                          readOnly
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">
                          <Mail className="w-4 h-4" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="form-input"
                          value={user?.email || ''}
                          placeholder="Enter your email"
                          readOnly
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">
                          <Github className="w-4 h-4" />
                          GitHub Username
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={user?.username || ''}
                          placeholder="GitHub username"
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="form-actions">
                      <button className="btn btn-primary" disabled>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </button>
                      <p className="form-note">Profile information is synced from GitHub</p>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="tab-panel">
                    <h2 className="tab-title">Security Settings</h2>
                    <div className="security-section">
                      <div className="security-item">
                        <div className="security-item-info">
                          <h3>GitHub Authentication</h3>
                          <p>Connected via GitHub OAuth</p>
                        </div>
                        <div className="security-item-status">
                          <span className="status-badge success">Connected</span>
                        </div>
                      </div>
                      <div className="security-item">
                        <div className="security-item-info">
                          <h3>Session Management</h3>
                          <p>Automatically log out inactive sessions</p>
                        </div>
                        <div className="security-item-actions">
                          <button className="btn btn-secondary" onClick={logout}>
                            Sign Out All Sessions
                          </button>
                        </div>
                      </div>
                      <div className="security-item">
                        <div className="security-item-info">
                          <h3>Account Security</h3>
                          <p>Your account is protected by GitHub&apos;s security measures</p>
                        </div>
                        <div className="security-item-status">
                          <span className="status-badge success">Secure</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'api-keys' && (
                  <div className="tab-panel">
                    <h2 className="tab-title">API Keys</h2>
                    <div className="api-keys-section">
                      <div className="api-key-create">
                        <div className="form-group">
                          <label className="form-label">Create New API Key</label>
                          <div className="api-key-input-group">
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Enter key name (e.g., Development, Production)"
                              value={newKeyName}
                              onChange={(e) => setNewKeyName(e.target.value)}
                            />
                            <button
                              className="btn btn-primary"
                              onClick={handleGenerateApiKey}
                              disabled={!newKeyName.trim()}
                            >
                              <Key className="w-4 h-4" />
                              Generate
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="api-keys-list">
                        {apiKeys.map(apiKey => (
                          <div key={apiKey.id} className="api-key-item">
                            <div className="api-key-info">
                              <h3 className="api-key-name">{apiKey.name}</h3>
                              <div className="api-key-details">
                                <span>Created: {apiKey.created}</span>
                                <span>Last used: {apiKey.lastUsed}</span>
                              </div>
                            </div>
                            <div className="api-key-value">
                              <div className="api-key-display">
                                <code className="api-key-text">
                                  {showKeys[apiKey.id] ? apiKey.key : `${apiKey.key.slice(0, 12)}...`}
                                </code>
                                <div className="api-key-actions">
                                  <button
                                    className="action-btn"
                                    onClick={() => toggleKeyVisibility(apiKey.id)}
                                    title={showKeys[apiKey.id] ? 'Hide key' : 'Show key'}
                                  >
                                    {showKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                  <button
                                    className="action-btn"
                                    onClick={() => copyToClipboard(apiKey.key)}
                                    title="Copy to clipboard"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                  <button
                                    className="action-btn danger"
                                    onClick={() => handleDeleteApiKey(apiKey.id)}
                                    title="Delete key"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'preferences' && (
                  <div className="tab-panel">
                    <h2 className="tab-title">Preferences</h2>
                    <div className="preferences-section">
                      <div className="preference-group">
                        <h3>Dashboard Settings</h3>
                        <label className="preference-item">
                          <input type="checkbox" defaultChecked />
                          <span>Enable real-time updates</span>
                        </label>
                        <label className="preference-item">
                          <input type="checkbox" defaultChecked />
                          <span>Show detailed metrics</span>
                        </label>
                        <label className="preference-item">
                          <input type="checkbox" />
                          <span>Enable notifications</span>
                        </label>
                      </div>
                      <div className="preference-group">
                        <h3>Interface</h3>
                        <label className="preference-item">
                          <input type="checkbox" defaultChecked />
                          <span>Dark theme</span>
                        </label>
                        <label className="preference-item">
                          <input type="checkbox" />
                          <span>Compact layout</span>
                        </label>
                      </div>
                    </div>
                    <div className="form-actions">
                      <button className="btn btn-primary">
                        <Save className="w-4 h-4" />
                        Save Preferences
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}