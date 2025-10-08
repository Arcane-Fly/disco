import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useGestures } from '../hooks/useGestures';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import type { LucideIcon } from 'lucide-react';
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

type TabId = 'profile' | 'security' | 'api-keys' | 'preferences';

type ApiKey = {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
};

const tabs: Array<{ id: TabId; label: string; icon: LucideIcon; helper: string }> = [
  { id: 'profile', label: 'Profile', icon: User, helper: 'Personal information' },
  { id: 'security', label: 'Security', icon: Shield, helper: 'Authentication and access' },
  { id: 'api-keys', label: 'API Keys', icon: Key, helper: 'Manage programmatic access' },
  { id: 'preferences', label: 'Preferences', icon: Settings, helper: 'Interface options' }
];

export default function Profile() {
  const { user, logout } = useAuth();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { id: '1', name: 'Development Key', key: 'dcp_live_abc123...', created: '2025-01-15', lastUsed: '2025-01-16' },
    { id: '2', name: 'Production Key', key: 'dcp_live_xyz789...', created: '2025-01-10', lastUsed: '2025-01-16' }
  ]);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState('');

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

  useEffect(() => {
    const tabContent = document.querySelector('.profile-tab-content');
    if (!tabContent) return;

    tabContent.addEventListener('touchstart', gestureHandlers.onTouchStart);
    tabContent.addEventListener('touchmove', gestureHandlers.onTouchMove);
    tabContent.addEventListener('touchend', gestureHandlers.onTouchEnd);

    return () => {
      tabContent.removeEventListener('touchstart', gestureHandlers.onTouchStart);
      tabContent.removeEventListener('touchmove', gestureHandlers.onTouchMove);
      tabContent.removeEventListener('touchend', gestureHandlers.onTouchEnd);
    };
  }, [gestureHandlers]);

  const generateSecureApiKey = (length = 20) => {
    if (typeof window === 'undefined') {
      return '';
    }

    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array)).replace(/[^a-zA-Z0-9]/g, '').substring(0, length);
  };

  const handleGenerateApiKey = () => {
    if (!newKeyName.trim()) return;

    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `dcp_live_${generateSecureApiKey(20)}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never'
    };

    setApiKeys((previous) => [...previous, newKey]);
    setNewKeyName('');

    addNotification({
      type: 'success',
      title: 'API Key Generated',
      message: `New API key "${newKey.name}" has been created successfully.`
    });
  };

  const handleDeleteApiKey = (keyId: string) => {
    const keyToDelete = apiKeys.find(key => key.id === keyId);
    setApiKeys(previous => previous.filter(key => key.id !== keyId));

    addNotification({
      type: 'info',
      title: 'API Key Deleted',
      message: `API key "${keyToDelete?.name ?? 'Unknown'}" has been deleted.`
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
    } catch {
      addNotification({
        type: 'error',
        title: 'Copy Failed',
        message: 'Failed to copy API key to clipboard. Please try again.'
      });
    }
  };

  const renderTabNavigation = () => (
    <nav className="flex flex-wrap gap-2">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`group flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 ${
              isActive
                ? 'border-[color-mix(in_oklab,var(--brand-cyan)_35%,transparent)] bg-[color-mix(in_oklab,var(--brand-cyan)_12%,transparent)] text-text-primary shadow-elev-1'
                : 'border-border-subtle bg-[color-mix(in_oklab,var(--bg-secondary)_92%,transparent)] text-text-secondary hover:text-text-primary hover:border-brand-cyan'
            }`}
            aria-pressed={isActive}
            aria-label={`${tab.label} tab`}
          >
            <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-brand-cyan' : 'text-text-muted group-hover:text-brand-cyan'}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );

  const renderProfileTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-text-primary">Profile information</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="form-label inline-flex items-center gap-2 text-sm font-medium text-text-secondary">
            <User className="h-4 w-4" />
            Full name
          </label>
          <input
            type="text"
            className="form-input"
            value={user?.name ?? ''}
            placeholder="Enter your full name"
            readOnly
          />
        </div>
        <div className="space-y-2">
          <label className="form-label inline-flex items-center gap-2 text-sm font-medium text-text-secondary">
            <Mail className="h-4 w-4" />
            Email address
          </label>
          <input
            type="email"
            className="form-input"
            value={user?.email ?? ''}
            placeholder="Enter your email"
            readOnly
          />
        </div>
        <div className="space-y-2">
          <label className="form-label inline-flex items-center gap-2 text-sm font-medium text-text-secondary">
            <Github className="h-4 w-4" />
            GitHub username
          </label>
          <input
            type="text"
            className="form-input"
            value={user?.username ?? ''}
            placeholder="GitHub username"
            readOnly
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" disabled className="gap-2">
          <Save className="h-4 w-4" />
          Save changes
        </Button>
        <p className="text-sm text-text-secondary">Profile information is synced from GitHub.</p>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-text-primary">Security</h2>
      <div className="space-y-3">
        <div className="flex flex-col gap-3 rounded-xl border border-border-moderate bg-[color-mix(in_oklab,var(--bg-secondary)_92%,transparent)] p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-medium text-text-primary">GitHub authentication</h3>
            <p className="text-sm text-text-secondary">Connected via GitHub OAuth.</p>
          </div>
          <span className="status-pill status-pill--success">Connected</span>
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-border-moderate bg-[color-mix(in_oklab,var(--bg-secondary)_92%,transparent)] p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-medium text-text-primary">Session management</h3>
            <p className="text-sm text-text-secondary">Automatically log out inactive sessions.</p>
          </div>
          <Button variant="secondary" onClick={logout} className="gap-2 whitespace-nowrap">
            Sign out all sessions
          </Button>
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-border-moderate bg-[color-mix(in_oklab,var(--bg-secondary)_92%,transparent)] p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-medium text-text-primary">Account security</h3>
            <p className="text-sm text-text-secondary">Your account is protected by GitHub&apos;s security measures.</p>
          </div>
          <span className="status-pill status-pill--success">Secure</span>
        </div>
      </div>
    </div>
  );

  const renderApiKeysTab = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-text-primary">API keys</h2>
        <p className="text-sm text-text-secondary">Generate and manage secure tokens for client integrations.</p>
      </div>
      <Card variant="default" className="space-y-4">
        <div className="space-y-2">
          <label className="form-label text-sm font-medium text-text-secondary">Create new API key</label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              className="form-input"
              placeholder="Enter key name (e.g., Development, Production)"
              value={newKeyName}
              onChange={(event) => setNewKeyName(event.target.value)}
            />
            <Button
              variant="primary"
              onClick={handleGenerateApiKey}
              disabled={!newKeyName.trim()}
              className="gap-2 whitespace-nowrap"
            >
              <Key className="h-4 w-4" />
              Generate
            </Button>
          </div>
        </div>
      </Card>
      <div className="space-y-4">
        {apiKeys.map(apiKey => {
          const isVisible = showKeys[apiKey.id];
          return (
            <Card key={apiKey.id} variant="default" className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">{apiKey.name}</h3>
                  <div className="flex flex-wrap gap-3 text-xs text-text-secondary">
                    <span>Created: {apiKey.created}</span>
                    <span>Last used: {apiKey.lastUsed}</span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-[color-mix(in_oklab,var(--bg-secondary)_92%,transparent)] px-3 py-2 font-mono text-xs text-text-secondary">
                  {isVisible ? apiKey.key : `${apiKey.key.slice(0, 12)}…`}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleKeyVisibility(apiKey.id)}
                  className="gap-1"
                  aria-label={isVisible ? 'Hide API key' : 'Show API key'}
                >
                  {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {isVisible ? 'Hide' : 'Reveal'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(apiKey.key)}
                  className="gap-1"
                  aria-label="Copy API key"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteApiKey(apiKey.id)}
                  className="gap-1"
                  aria-label="Delete API key"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </Card>
          );
        })}
        {apiKeys.length === 0 && (
          <div className="callout callout--info text-sm">No API keys yet. Generate your first key to begin integrating Disco MCP.</div>
        )}
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-text-primary">Preferences</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Card variant="default" className="space-y-3">
          <h3 className="text-lg font-semibold text-text-primary">Dashboard settings</h3>
          <label className="flex items-start gap-2 text-sm text-text-secondary">
            <input type="checkbox" defaultChecked className="mt-1" />
            <span>Enable real-time updates</span>
          </label>
          <label className="flex items-start gap-2 text-sm text-text-secondary">
            <input type="checkbox" defaultChecked className="mt-1" />
            <span>Show detailed metrics</span>
          </label>
          <label className="flex items-start gap-2 text-sm text-text-secondary">
            <input type="checkbox" className="mt-1" />
            <span>Enable notifications</span>
          </label>
        </Card>
        <Card variant="default" className="space-y-3">
          <h3 className="text-lg font-semibold text-text-primary">Interface</h3>
          <label className="flex items-start gap-2 text-sm text-text-secondary">
            <input type="checkbox" defaultChecked className="mt-1" />
            <span>Dark theme</span>
          </label>
          <label className="flex items-start gap-2 text-sm text-text-secondary">
            <input type="checkbox" className="mt-1" />
            <span>Compact layout</span>
          </label>
        </Card>
      </div>
      <div>
        <Button variant="primary" className="gap-2">
          <Save className="h-4 w-4" />
          Save preferences
        </Button>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <Layout>
        <section className="page-section">
          <div className="container space-y-8">
            <header className="page-header">
              <h1 className="page-header__title">Account</h1>
              <p className="page-header__description">Manage your Disco MCP profile, security posture, and integration preferences.</p>
            </header>

            <div className="grid gap-6 lg:grid-cols-[320px,minmax(0,1fr)]">
              <Card variant="elevated" className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-border-moderate bg-[color-mix(in_oklab,var(--bg-secondary)_92%,transparent)]">
                    {user?.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.username ?? 'User avatar'}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-brand-cyan">
                        <User className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-semibold text-text-primary">{user?.name ?? user?.username}</h2>
                      <span className="status-pill status-pill--success">GitHub connected</span>
                    </div>
                    <p className="text-sm text-text-secondary">@{user?.username}</p>
                    <p className="text-sm text-text-secondary">{user?.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-text-secondary">
                    Keep your profile information up to date and manage secure access tokens for integrating Disco MCP with your favourite clients.
                  </p>
                </div>
              </Card>

              <Card variant="elevated" className="space-y-6">
                {renderTabNavigation()}
                <div className="profile-tab-content space-y-6">
                  {activeTab === 'profile' && renderProfileTab()}
                  {activeTab === 'security' && renderSecurityTab()}
                  {activeTab === 'api-keys' && renderApiKeysTab()}
                  {activeTab === 'preferences' && renderPreferencesTab()}
                </div>
              </Card>
            </div>
          </div>
        </section>
      </Layout>
    </ProtectedRoute>
  );
}
