// Enhanced Setup Wizard JavaScript for Legacy-Root Interface
// Auto-refresh token logic and guided setup experience

class DiscoSetupWizard {
  constructor() {
    this.token = localStorage.getItem('disco_token');
    this.user = localStorage.getItem('disco_user');
    this.currentStep = 1;
    this.selectedPlatform = null;
    this.healthCheckInterval = null;
    this.tokenRefreshInterval = null;
    this.notifications = [];
    
    this.init();
  }

  init() {
    this.checkAuthFromURL();
    this.setupEventListeners();
    this.startHealthMonitoring();
    this.updateUI();
    this.updateWizardProgress();
    
    if (this.token) {
      this.scheduleTokenRefresh();
    }
  }

  checkAuthFromURL() {
    const hash = window.location.hash;
    if (hash.includes('token=')) {
      const params = new URLSearchParams(hash.substring(1));
      this.token = params.get('token');
      this.user = params.get('user');
      
      if (this.token) {
        localStorage.setItem('disco_token', this.token);
        localStorage.setItem('disco_user', this.user || '');
        window.location.hash = '';
        this.showNotification('success', 'Successfully authenticated with GitHub!');
        this.scheduleTokenRefresh();
      }
    } else {
      this.token = localStorage.getItem('disco_token');
      this.user = localStorage.getItem('disco_user');
    }
  }

  async scheduleTokenRefresh() {
    if (!this.token) return;

    try {
      const response = await fetch('/api/v1/auth/status', {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const refreshNeeded = data.data.token.refresh_needed;
        const timeToExpiry = data.data.token.expires_in;
        
        if (refreshNeeded) {
          await this.refreshToken();
        } else {
          // Schedule refresh 15 minutes before expiry
          const refreshTime = Math.max(timeToExpiry - 15 * 60 * 1000, 60000);
          this.tokenRefreshInterval = setTimeout(() => this.refreshToken(), refreshTime);
        }
      }
    } catch (error) {
      console.warn('Token status check failed:', error);
    }
  }

  async refreshToken() {
    try {
      const response = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.token}` }
      });

      if (response.ok) {
        const data = await response.json();
        this.token = data.data.token;
        localStorage.setItem('disco_token', this.token);
        
        this.showNotification('info', 'Authentication token refreshed automatically');
        this.scheduleTokenRefresh();
        this.updateTokenPlaceholders();
      } else {
        this.handleAuthFailure();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.handleAuthFailure();
    }
  }

  handleAuthFailure() {
    if (this.tokenRefreshInterval) {
      clearTimeout(this.tokenRefreshInterval);
    }
    
    localStorage.removeItem('disco_token');
    localStorage.removeItem('disco_user');
    this.token = null;
    this.user = null;
    
    this.showNotification('error', 'Authentication expired. Please log in again.');
    this.updateUI();
    this.updateWizardProgress();
  }

  showNotification(type, message) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Hide notification after 5 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 5000);
  }

  cleanup() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    if (this.tokenRefreshInterval) {
      clearTimeout(this.tokenRefreshInterval);
    }
  }
}

// Initialize the setup wizard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.discoSetupWizard = new DiscoSetupWizard();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.discoSetupWizard) {
    window.discoSetupWizard.cleanup();
  }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DiscoSetupWizard;
}