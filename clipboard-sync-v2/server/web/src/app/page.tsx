'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Copy, RefreshCw, Zap, Lock, Share2, Smartphone, Check, Clipboard } from 'lucide-react';

const FeatureCard = ({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) => {
  const colorMap: Record<string, string> = {
    indigo: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
    emerald: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    rose: 'bg-rose-100 text-rose-700 border-rose-200',
    violet: 'bg-violet-100 text-violet-700 border-violet-200',
    cyan: 'bg-sky-100 text-sky-700 border-sky-200',
  };

  const bgClass = colorMap[color] || colorMap['indigo'];
  
  return (
    <div className={`p-6 rounded-2xl bg-white/90 backdrop-blur-sm border ${bgClass.split(' ')[2]} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
      <div className={`w-12 h-12 rounded-xl ${bgClass.split(' ')[0]} flex items-center justify-center ${bgClass.split(' ')[1]} mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const Step = ({ number, title, color }: { number: number; title: string; color: string }) => {
  const colorMap: Record<string, string> = {
    indigo: 'text-fuchsia-700 bg-fuchsia-100',
    emerald: 'text-cyan-700 bg-cyan-100',
    amber: 'text-amber-700 bg-amber-100',
    rose: 'text-rose-700 bg-rose-100',
    violet: 'text-violet-700 bg-violet-100',
    cyan: 'text-sky-700 bg-sky-100',
  };

  const colorClass = colorMap[color] || colorMap['indigo'];
  
  return (
    <div className="flex items-center space-x-4">
      <div className={`w-8 h-8 rounded-full ${colorClass.split(' ')[1]} flex-shrink-0 flex items-center justify-center ${colorClass.split(' ')[0]} font-medium`}>
        {number}
      </div>
      <span className="text-gray-700">{title}</span>
    </div>
  );
};

function HomeContent() {
  const [token, setToken] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Color theme - Subtle and Professional
  const theme = {
    primary: 'from-fuchsia-500 to-pink-600',
    secondary: 'from-purple-600 to-indigo-600',
    accent: 'from-cyan-400 to-sky-500',
    success: 'from-emerald-400 to-teal-500',
    warning: 'from-amber-400 to-orange-400',
  };

    // Check for token in URL or local storage on component mount
    useEffect(() => {
        // Check for token in URL first (for backward compatibility)
        const urlToken = searchParams?.get('token');

        // Then check local storage
        const storedToken = localStorage.getItem('clipboardSyncToken');

        if (urlToken) {
            // If token is in URL, save it to local storage and redirect
            localStorage.setItem('clipboardSyncToken', urlToken);
            router.replace(`/${urlToken}`);
        } else if (storedToken) {
            // If token is in local storage, pre-fill the input
            setToken(storedToken);
        }
    }, [searchParams, router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (token.trim()) {
            router.push(`/${token}`);
        }
    };

  const generateNewToken = () => {
    const newToken = `token_${Math.random().toString(36).substr(2, 9)}`;
    setToken(newToken);
    setIsCopied(false);
  };

  const copyToClipboard = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3">
      <div className="w-full max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center py-4 sm:py-8 md:py-12">
          <div className="flex items-center justify-center gap-4 mb-4 md:mb-6">
    
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900">
              Clipboard Sync
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            A simple and efficient solution for sharing text between devices
          </p>
        </div>

        {/* Main Card */}
        <div className="w-full bg-gradient-to-br from-fuchsia-50 to-pink-50 p-6 sm:p-8 mb-6 sm:mb-12 rounded-xl border-2 border-fuchsia-100 shadow-lg">
          <div className="text-center space-y-1 mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Access Your Clipboard
            </h2>
            <p className="text-gray-500 text-sm">
              Enter or generate a token to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="relative">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => {
                      setToken(e.target.value);
                      setIsCopied(false);
                    }}
                    placeholder="Enter or generate a token"
                    className="w-full px-4 sm:px-5 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-150 text-sm sm:text-base bg-white/80 hover:bg-white"
                    required
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  {token && (
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-3 sm:py-0 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      {isCopied ? (
                        <>
                          <Check size={16} className="flex-shrink-0" />
                          <span className="whitespace-nowrap">Copied!</span>
                        </>
                      ) : (
                        <Copy size={16} className="flex-shrink-0" />
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={generateNewToken}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-3 sm:py-0 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <RefreshCw size={16} className="flex-shrink-0" />
                    <span className="whitespace-nowrap">New</span>
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Save this token to access your clipboard from other devices
              </p>
            </div>

            <button
              type="submit"
              disabled={!token.trim()}
              className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium hover:opacity-90 disabled:opacity-50 transition-all duration-200 flex items-center justify-center space-x-2 hover:shadow-md"
            >
              <Zap size={18} />
              <span>Access My Clipboard</span>
            </button>
          </form>
        </div>

        {/* Features */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <FeatureCard
            icon={<Share2 className="w-6 h-6" />}
            title="Real-time Sync"
            description="Instantly share text between devices"
            color="violet"
          />
          <FeatureCard
            icon={<Lock className="w-6 h-6" />}
            title="Token-based Access"
            description="Generate a token to connect your devices"
            color="indigo"
          />
          <FeatureCard
            icon={<Smartphone className="w-6 h-6" />}
            title="No Installation"
            description="Works directly in your web browser"
            color="cyan"
          />
        </div>

        {/* How It Works */}
        <div className="w-full bg-white/90 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-semibold text-center mb-8 text-gray-800">How It Works</h2>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
              <Step number={1} title="Generate a Token" color="indigo" />
              <div className="h-1 w-8 bg-indigo-200 rounded-full hidden md:block"></div>
              <Step number={2} title="Share the Token" color="emerald" />
              <div className="h-1 w-8 bg-emerald-200 rounded-full hidden md:block"></div>
              <Step number={3} title="Start Syncing" color="amber" />
            </div>
            <p className="text-center text-gray-600 max-w-2xl mx-auto mt-6">
              Copy on one device, paste on another - it's that simple!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function Home() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}