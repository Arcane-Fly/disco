import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { CompactThemeToggle } from './ui/ThemeToggle';
import { 
  Menu, 
  X, 
  Code2, 
  BarChart3, 
  Terminal, 
  Github, 
  LogOut,
  User,
  ChevronDown,
  Settings
} from 'lucide-react';

export default function Navigation() {
  const { user, login, logout } = useAuth();
  const { selectionChanged, impactLight } = useHapticFeedback();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();

  const navLinks = [
    { href: '/app-dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" />, protected: true },
    { href: '/webcontainer-loader', label: 'WebContainer', icon: <Terminal className="w-4 h-4" />, protected: true },
    { href: '/legacy-root', label: 'Classic', icon: <Code2 className="w-4 h-4" />, protected: false },
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
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-content">
          {/* Logo */}
          <Link href="/" className="nav-logo">
            <Code2 className="w-8 h-8" />
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
                {link.icon}
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
                    <img src={user.avatar_url} alt={user.username} className="user-avatar" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  <span className="user-name">{user.username}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {userMenuOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <div className="user-info">
                        <p className="user-name">{user.username}</p>
                        <p className="user-email">{user.email}</p>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link href="/profile" className="dropdown-item">
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link href="/settings" className="dropdown-item">
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <div className="dropdown-divider"></div>
                    <div className="px-3 py-2">
                      <CompactThemeToggle />
                    </div>
                    <div className="dropdown-divider"></div>
                    <button onClick={logout} className="dropdown-item danger">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={login} className="btn-signin">
                <Github className="w-5 h-5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-menu-toggle"
              onClick={handleMobileMenuToggle}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="nav-mobile">
            {visibleLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link-mobile ${router.pathname === link.href ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
            
            {!user && (
              <button onClick={login} className="btn-signin-mobile">
                <Github className="w-5 h-5" />
                Sign In with GitHub
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}