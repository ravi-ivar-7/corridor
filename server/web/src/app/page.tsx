'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Share2, Lock, Monitor, Smartphone, Chrome } from 'lucide-react';
import { TokenInput } from '@/components/TokenInput';

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
  const router = useRouter();
  const searchParams = useSearchParams();

    // Check for token in URL or local storage on component mount
    useEffect(() => {
        // Check for token in URL first (for backward compatibility)
        const urlToken = searchParams?.get('token');


        if (urlToken) {
            // If token is in URL, save it to local storage and redirect
            localStorage.setItem('clipboardSyncToken', urlToken);
            router.replace(`/${urlToken}`);
        }
    }, [searchParams, router]);

    const handleSubmit = (token: string) => {
        if (token.trim()) {
            router.push(`/${token}`);
        }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3">
      <div className="w-full max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center py-4 sm:py-8 md:py-12">
          <div className="flex items-center justify-center gap-4 mb-4 md:mb-6">
    
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900">
              Corridor
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Real-time clipboard synchronization across devices
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

          <TokenInput onSubmit={handleSubmit} />
        </div>

        {/* Features */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <FeatureCard
            icon={<Share2 className="w-6 h-6" />}
            title="Real-time Sync"
            description="Instantly share text across all your devices"
            color="violet"
          />
          <FeatureCard
            icon={<Lock className="w-6 h-6" />}
            title="Token-based Access"
            description="Secure connection with a single token"
            color="indigo"
          />
          <FeatureCard
            icon={<Monitor className="w-6 h-6" />}
            title="Multi-Platform"
            description="Windows, Linux, Android, and Web support"
            color="cyan"
          />
        </div>

        {/* Platform Cards */}
        <div className="w-full bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-gray-200 shadow-sm mb-6 sm:mb-8">
          <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">Available Platforms</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 mb-3">
                <Monitor className="w-6 h-6" />
              </div>
              <span className="font-medium text-gray-800">Windows</span>
              <span className="text-xs text-gray-500 mt-1">Native App</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-700 mb-3">
                <Monitor className="w-6 h-6" />
              </div>
              <span className="font-medium text-gray-800">Linux</span>
              <span className="text-xs text-gray-500 mt-1">Native App</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-700 mb-3">
                <Smartphone className="w-6 h-6" />
              </div>
              <span className="font-medium text-gray-800">Android</span>
              <span className="text-xs text-gray-500 mt-1">Mobile App</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 mb-3">
                <Chrome className="w-6 h-6" />
              </div>
              <span className="font-medium text-gray-800">Web</span>
              <span className="text-xs text-gray-500 mt-1">Browser</span>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="w-full bg-white/90 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-semibold text-center mb-8 text-gray-800">How It Works</h2>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
              <Step number={1} title="Download & Install" color="indigo" />
              <div className="h-1 w-8 bg-indigo-200 rounded-full hidden md:block"></div>
              <Step number={2} title="Enter a Token" color="emerald" />
              <div className="h-1 w-8 bg-emerald-200 rounded-full hidden md:block"></div>
              <Step number={3} title="Start Syncing" color="amber" />
            </div>
            <p className="text-center text-gray-600 max-w-2xl mx-auto mt-6">
              Download native apps for Windows, Linux, or Android - or use directly in your browser. Copy on one device, paste on another!
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