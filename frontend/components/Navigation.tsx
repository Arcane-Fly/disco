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
    <nav className="navigation" suppressHydrationWarning>
      <div className="nav-container">
        <div className="nav-content">
          {/* Logo */}
          <Link href="/" className="nav-logo">
            <Icon name="Code2" size={32} className="text-blue-500" />
            <span>Disco MCP</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-links desktop">
            {visibleLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${router.pathname === link.href ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <Icon name={link.icon as keyof typeof import('lucide-react')} size={16} />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="nav-auth">
            <CompactThemeToggle />
            {user ? (
              <div className="user-menu">
                <button
                  className="user-menu-trigger"
                  onClick={handleUserMenuToggle}
                >
                  {user.avatar_url ? (
                    <Image 
                      src={user.avatar_url} 
                      alt={user.username} 
                      className="user-avatar"
                      width={20}
                      height={20}
                    />
                  ) : (
                    <Icon name="User" size={20} />
                  )}
                  <span>{user.username}</span>
                  <Icon name="ChevronDown" size={16} />
                </button>

                {userMenuOpen && (
                  <div className="user-menu-dropdown">
                    <Link href="/profile" className="menu-item">
                      <Icon name="User" size={16} />
                      <span>Profile</span>
                    </Link>
                    <Link href="/api-config" className="menu-item">
                      <Icon name="Settings" size={16} />
                      <span>Settings</span>
                    </Link>
                    <hr className="menu-divider" />
                    <button onClick={logout} className="menu-item">
                      <Icon name="LogOut" size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={login} className="sign-in-btn">
                <Icon name="Github" size={16} />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              className="mobile-menu-toggle"
              onClick={handleMobileMenuToggle}
            >
              <Icon name={mobileMenuOpen ? "X" : "Menu"} size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="nav-links mobile">
            {visibleLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${router.pathname === link.href ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <Icon name={link.icon as keyof typeof import('lucide-react')} size={16} />
                <span>{link.label}</span>
              </Link>
            ))}
            {!user && (
              <button onClick={() => { login(); handleNavClick(); }} className="nav-link">
                <Icon name="Github" size={16} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}