import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { CompactThemeToggle } from './ui/ThemeToggle';
import { Icon } from './ui/Icon';

export default function Navigation() {
  const { user, login, logout } = useAuth();
  const { selectionChanged, impactLight } = useHapticFeedback();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();

  const navLinks = [
    { href: '/app-dashboard', label: 'Dashboard', icon: 'BarChart3', protected: true },
    { href: '/workflow-builder', label: 'Workflow Builder', icon: 'GitBranch', protected: true },
    { href: '/api-config', label: 'API', icon: 'Key', protected: true },
    { href: '/analytics', label: 'Analytics', icon: 'TrendingUp', protected: true },
    { href: '/webcontainer-loader', label: 'WebContainer', icon: 'Terminal', protected: true },
    { href: '/legacy-root', label: 'Classic', icon: 'Code2', protected: false },
  ];

  const visibleLinks = navLinks.filter(link => !link.protected || user);

  const handleMobileMenuToggle = () => {
    impactLight();
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleUserMenuToggle = () => {
    selectionChanged();
    setUserMenuOpen(!userMenuOpen);
  };

  const handleNavClick = () => {
    selectionChanged();
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-[var(--z-sticky)] border-b border-border-subtle bg-bg-secondary/80 backdrop-blur-md" suppressHydrationWarning>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity">
            <Icon name="Code2" size={32} className="text-blue-500" />
            <span className="hidden sm:inline">Disco MCP</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {visibleLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  router.pathname === link.href 
                    ? 'bg-bg-tertiary text-text-primary' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'
                }`}
                onClick={handleNavClick}
              >
                <Icon name={link.icon as keyof typeof import('lucide-react')} size={16} />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-2">
            <CompactThemeToggle />
            {user ? (
              <div className="relative">
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                  onClick={handleUserMenuToggle}
                >
                  {user.avatar_url ? (
                    <Image 
                      src={user.avatar_url} 
                      alt={user.username} 
                      className="rounded-full"
                      width={20}
                      height={20}
                    />
                  ) : (
                    <Icon name="User" size={20} />
                  )}
                  <span className="hidden sm:inline">{user.username}</span>
                  <Icon name="ChevronDown" size={16} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-bg-secondary border border-border-subtle rounded-lg shadow-lg z-[var(--z-dropdown)]">
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors">
                      <Icon name="User" size={16} />
                      <span>Profile</span>
                    </Link>
                    <Link href="/api-config" className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors">
                      <Icon name="Settings" size={16} />
                      <span>Settings</span>
                    </Link>
                    <hr className="my-2 border-border-subtle" />
                    <button onClick={logout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors">
                      <Icon name="LogOut" size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={login} className="flex items-center gap-2 px-4 py-2 bg-brand-cyan text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                <Icon name="Github" size={16} />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
              onClick={handleMobileMenuToggle}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              title={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <Icon name={mobileMenuOpen ? "X" : "Menu"} size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border-subtle">
            <div className="flex flex-col gap-1">
              {visibleLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    router.pathname === link.href 
                      ? 'bg-bg-tertiary text-text-primary' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'
                  }`}
                  onClick={handleNavClick}
                >
                  <Icon name={link.icon as keyof typeof import('lucide-react')} size={16} />
                  <span>{link.label}</span>
                </Link>
              ))}
              {!user && (
                <button 
                  onClick={() => { login(); handleNavClick(); }} 
                  className="flex items-center gap-3 px-4 py-3 mt-2 bg-brand-cyan text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Icon name="Github" size={16} />
                  <span>Sign In with GitHub</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}