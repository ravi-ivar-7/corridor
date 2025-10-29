'use client';

import { RefreshCw, Cpu, Server, Smartphone, Check } from 'lucide-react';
import Link from 'next/link';

export default function WhatIsClipboardSync() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50/30 py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 sm:mb-16 relative">
          <div className="absolute -top-2 -left-4 w-24 h-24 bg-amber-100/50 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
          <div className="absolute -bottom-2 -right-4 w-24 h-24 bg-violet-100/50 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-3 sm:mb-4 bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">
              What is Corridor?
            </h1>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-amber-50 shadow-sm overflow-hidden mb-12 relative">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-100/30 rounded-full mix-blend-multiply filter blur-2xl"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-violet-100/30 rounded-full mix-blend-multiply filter blur-2xl"></div>
          
          <div className="relative z-10 p-4 sm:p-6 md:p-8 lg:p-10">
            <div className="prose prose-amber max-w-none">
              <p className="text-stone-700/90 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
                Corridor is a background service that works silently to keep your clipboard in sync across all your devices. 
                Copy text on one machine, and it&apos;s instantly available to paste on any other device - no manual syncing required.
              </p>
              
              <h2 className="text-xl sm:text-2xl font-semibold text-stone-800 mt-8 sm:mt-10 md:mt-12 mb-6 sm:mb-8 relative inline-block">
                <span className="relative z-10">How It Works</span>
                <span className="absolute -bottom-1 left-0 w-full h-1.5 bg-amber-200/60 rounded-full"></span>
              </h2>
              
              <div className="grid gap-6 sm:grid-cols-2 mt-8">
                <div className="p-6 bg-gradient-to-br from-amber-50/50 to-amber-50/20 rounded-2xl border border-amber-100/50 shadow-sm hover:shadow-amber-100/50 transition-shadow duration-200">
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-xl bg-amber-100/50 border border-amber-200/50 flex items-center justify-center mr-4 flex-shrink-0">
                      <Cpu className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-800 mb-2">Background Service</h3>
                      <p className="text-stone-600/90 text-sm leading-relaxed">
                        Runs silently in the background, monitoring clipboard changes without interrupting your workflow.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-violet-50/50 to-violet-50/20 rounded-2xl border border-violet-100/50 shadow-sm hover:shadow-violet-100/50 transition-shadow duration-200">
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-xl bg-violet-100/50 border border-violet-200/50 flex items-center justify-center mr-4 flex-shrink-0">
                      <RefreshCw className="w-5 h-5 text-violet-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-800 mb-2">Real-time Sync</h3>
                      <p className="text-stone-600/90 text-sm leading-relaxed">
                        Instant synchronization between all connected devices the moment you copy or paste.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-emerald-50/50 to-emerald-50/20 rounded-2xl border border-emerald-100/50 shadow-sm hover:shadow-emerald-100/50 transition-shadow duration-200">
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100/50 border border-emerald-200/50 flex items-center justify-center mr-4 flex-shrink-0">
                      <Server className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-800 mb-2">Centralized Hub</h3>
                      <p className="text-stone-600/90 text-sm leading-relaxed">
                        All clipboard updates flow through a central server, keeping every device in perfect sync.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-rose-50/50 to-rose-50/20 rounded-2xl border border-rose-100/50 shadow-sm hover:shadow-rose-100/50 transition-shadow duration-200">
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-xl bg-rose-100/50 border border-rose-200/50 flex items-center justify-center mr-4 flex-shrink-0">
                      <Smartphone className="w-5 h-5 text-rose-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-800 mb-2">Multi-Device</h3>
                      <p className="text-stone-600/90 text-sm leading-relaxed">
                        Works across all your devices - desktops, laptops, and more - all staying in perfect harmony.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-10 sm:mt-14 md:mt-16 pt-6 sm:pt-8 border-t border-stone-100">
                <h2 className="text-2xl font-semibold text-stone-800 mb-8 relative inline-block">
                  <span className="relative z-10">Seamless Experience</span>
                  <span className="absolute -bottom-1 left-0 w-full h-1.5 bg-amber-200/60 rounded-full"></span>
                </h2>
                <div className="space-y-4 sm:space-y-6">
                  <div className="p-4 sm:p-5 bg-white/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-stone-100 shadow-sm hover:shadow-stone-100/50 transition-shadow duration-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center mt-0.5 mr-4">
                        <span className="text-amber-600 font-medium text-xs sm:text-sm">1</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-stone-800 mb-1 sm:mb-1.5 text-sm sm:text-base">Silent Background Operation</h3>
                        <p className="text-stone-600/90 text-xs sm:text-sm leading-relaxed">The service runs unobtrusively, only activating when you copy or paste, with no impact on system performance.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-5 bg-white/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-stone-100 shadow-sm hover:shadow-stone-100/50 transition-shadow duration-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center mt-0.5 mr-4">
                        <span className="text-violet-600 font-medium text-sm">2</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-stone-800 mb-1.5">Automatic Synchronization</h3>
                        <p className="text-stone-600/90 text-sm leading-relaxed">Any clipboard update on any connected device is instantly pushed to the server and distributed to all other devices.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-5 bg-white/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-stone-100 shadow-sm hover:shadow-stone-100/50 transition-shadow duration-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center mt-0.5 mr-4">
                        <span className="text-emerald-600 font-medium text-sm">3</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-stone-800 mb-1.5">Always Up-to-Date</h3>
                        <p className="text-stone-600/90 text-sm leading-relaxed">Your clipboard is continuously monitored and updated, ensuring you always have the latest content available.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-10 sm:mt-14 md:mt-16 pt-6 sm:pt-8 border-t border-stone-100">
                <h2 className="text-2xl font-semibold text-stone-800 mb-8 relative inline-block">
                  <span className="relative z-10">Why You&apos;ll Love It</span>
                  <span className="absolute -bottom-1 left-0 w-full h-1.5 bg-amber-200/60 rounded-full"></span>
                </h2>
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                  <div className="p-3 sm:p-4 bg-white/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-stone-100 shadow-sm hover:shadow-stone-100/50 transition-shadow duration-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mt-0.5 mr-3">
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <span className="text-stone-700/90 text-xs sm:text-sm leading-relaxed">Works automatically in the background - set it and forget it</span>
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-4 bg-white/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-stone-100 shadow-sm hover:shadow-stone-100/50 transition-shadow duration-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mt-0.5 mr-3">
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <span className="text-stone-700/90 text-xs sm:text-sm leading-relaxed">No manual syncing required - it just works</span>
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-4 bg-white/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-stone-100 shadow-sm hover:shadow-stone-100/50 transition-shadow duration-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mt-0.5 mr-3">
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <span className="text-stone-700/90 text-xs sm:text-sm leading-relaxed">Lightweight and efficient - minimal system resources used</span>
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-4 bg-white/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-stone-100 shadow-sm hover:shadow-stone-100/50 transition-shadow duration-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mt-0.5 mr-3">
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <span className="text-stone-700/90 text-xs sm:text-sm leading-relaxed">Instant updates across all connected devices</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-10 sm:mt-14 md:mt-16 pt-6 sm:pt-8 border-t border-stone-100">
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 text-center bg-gradient-to-br from-teal-50 to-emerald-50/30 border border-teal-100/50">
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-teal-100/30 rounded-full mix-blend-multiply filter blur-2xl"></div>
                  <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-100/30 rounded-full mix-blend-multiply filter blur-2xl"></div>
                  
                  <div className="relative z-10">
                    <h3 className="text-lg sm:text-xl font-semibold text-stone-800 mb-2 sm:mb-3">Experience Seamless Clipboard Sync</h3>
                    <p className="text-stone-600/90 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base">Start syncing your clipboard across devices in just a few simple steps.</p>
                    <Link 
                      href="/blogs/how-to-use" 
                      className="inline-flex items-center justify-center px-5 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-sm sm:text-base font-medium rounded-lg hover:shadow-lg hover:shadow-teal-100/50 transition-all duration-200"
                    >
                      Get Started Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mt-8 max-w-4xl mx-auto px-4">
          <Link 
            href="/blogs/use-cases" 
            className="group w-full sm:w-auto text-center inline-flex items-center justify-center text-blue-600 hover:text-blue-800 font-medium transition-all duration-200 py-2.5 px-5 rounded-lg hover:bg-blue-50 border border-blue-100 hover:border-blue-200"
          >
            <span>Explore Use Cases</span>
            <svg className="w-4 h-4 ml-2 flex-shrink-0 text-blue-500 group-hover:text-blue-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
