import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Github, Lock } from 'lucide-react';

interface DemoBannerProps {
  title: string;
  description: string;
}

export default function DemoBanner({ title, description }: DemoBannerProps) {
  const { login } = useAuth();

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 mb-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <Lock className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-2">{title} - Demo Mode</h2>
          <p className="text-blue-100 mb-4">
            {description} Sign in with GitHub to access full functionality and real data.
          </p>
          <button 
            onClick={login}
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            <Github className="w-5 h-5" />
            Sign in with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}