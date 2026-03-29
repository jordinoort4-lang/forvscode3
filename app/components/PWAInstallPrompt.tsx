'use client';

import { useState, useEffect } from 'react';

interface PWAInstallPromptProps {
  onInstalled: () => void;
  onClose: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt({ onInstalled, onClose }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installError, setInstallError] = useState('');

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      onInstalled();
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [onInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      setInstallError('Installation prompt not available. Please use your browser\'s "Add to Home Screen" option.');
      return;
    }

    setIsInstalling(true);
    setInstallError('');

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        onInstalled();
      } else {
        setInstallError('Installation was cancelled. Please try again or use your browser\'s "Add to Home Screen" option.');
      }
    } catch (err) {
      setInstallError('Installation failed. Please try using your browser\'s "Add to Home Screen" option.');
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header with banner image */}
        <div className="relative">
          <img 
            src="https://eljlxaowizfjmpndmsqc.supabase.co/storage/v1/object/public/ed/Gemini_Generated_Image_7a9e257a9e257a9e.png" 
            alt="OSM Advisor Banner" 
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold text-white mb-2">Install OSM Advisor</h2>
            <p className="text-white/90">Add to your home screen for the best experience</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Quick Access</p>
                <p className="text-sm text-gray-500">Launch directly from your home screen</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Offline Ready</p>
                <p className="text-sm text-gray-500">Works even without internet</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">Get weekly calculation reminders</p>
              </div>
            </div>
          </div>

          {/* Installation Instructions */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">How to install:</p>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Click the "Install" button below</li>
              <li>Confirm the installation prompt</li>
              <li>The app will be added to your home screen</li>
            </ol>
          </div>

          {installError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
              {installError}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isInstalling ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Installing...
                </span>
              ) : (
                'Install OSM Advisor'
              )}
            </button>

            <button
              onClick={onClose}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            Installation is required to complete registration and receive your weekly free calculation.
          </p>
        </div>
      </div>
    </div>
  );
}
