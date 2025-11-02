'use client';

import { Download, Monitor, Globe, CheckCircle, ArrowRight, Smartphone, Terminal, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function DownloadsPage() {
  const [copied, setCopied] = useState(false);

  const copyInstallCommand = () => {
    navigator.clipboard.writeText('curl -fsSL https://corridor.rknain.com/install-linux.sh | bash');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Download Corridor
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto px-2">
            Choose your platform and start syncing your clipboard across all your devices
          </p>
        </div>

        {/* Download Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          {/* Windows Client */}
          <div className="bg-gradient-to-br from-sky-50/50 to-white rounded-xl shadow-sm border border-sky-100/50 p-4 sm:p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6">
              <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mb-3 sm:mb-0 sm:mr-4">
                <Monitor className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Windows</h2>
                <p className="text-xs sm:text-sm text-slate-500">Desktop application</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              Native desktop app with system tray integration and automatic startup.
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-start text-xs sm:text-sm text-slate-600">
                <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>System tray & auto-start</span>
              </div>
              <div className="flex items-start text-xs sm:text-sm text-slate-600">
                <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Windows 10 or later</span>
              </div>
            </div>

            <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3 mb-4">
              <p className="text-xs text-amber-700">
                <strong>Note:</strong> Self-signed certificate - security warnings are expected.
              </p>
            </div>

            <div className="space-y-2">
              <a
                href="/Corridor.exe"
                download="Corridor.exe"
                className="w-full bg-sky-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors flex items-center justify-center"
              >
                <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Download
              </a>
              <Link
                href="/downloads/windows"
                className="w-full bg-white text-sky-600 border border-sky-200 py-2 px-4 rounded-lg text-xs sm:text-sm font-medium hover:bg-sky-50 transition-colors flex items-center justify-center"
              >
                View Details
              </Link>
            </div>
          </div>

          {/* Android App */}
          <div className="bg-gradient-to-br from-emerald-50/50 to-white rounded-xl shadow-sm border border-emerald-100/50 p-4 sm:p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-3 sm:mb-0 sm:mr-4">
                <Smartphone className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Android</h2>
                <p className="text-xs sm:text-sm text-slate-500">Mobile application</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              Mobile app with background sync service and clipboard history.
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-start text-xs sm:text-sm text-slate-600">
                <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Background sync & auto-start</span>
              </div>
              <div className="flex items-start text-xs sm:text-sm text-slate-600">
                <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Android 8.0 (API 26) or later</span>
              </div>
            </div>

            <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3 mb-4">
              <p className="text-xs text-amber-700">
                <strong>Note:</strong> Enable "Install from unknown sources" in settings.
              </p>
            </div>

            <div className="space-y-2">
              <a
                href="/Corridor.apk"
                download="Corridor.apk"
                className="w-full bg-emerald-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center"
              >
                <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Download
              </a>
              <Link
                href="/downloads/android"
                className="w-full bg-white text-emerald-600 border border-emerald-200 py-2 px-4 rounded-lg text-xs sm:text-sm font-medium hover:bg-emerald-50 transition-colors flex items-center justify-center"
              >
                View Details
              </Link>
            </div>
          </div>

          {/* Linux Client */}
          <div className="bg-gradient-to-br from-orange-50/50 to-white rounded-xl shadow-sm border border-orange-100/50 p-4 sm:p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3 sm:mb-0 sm:mr-4">
                <Terminal className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Linux</h2>
                <p className="text-xs sm:text-sm text-slate-500">Desktop application</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              Single-file binary for Ubuntu, Fedora, Arch, and more.
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-start text-xs sm:text-sm text-slate-600">
                <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>X11 & Wayland support</span>
              </div>
              <div className="flex items-start text-xs sm:text-sm text-slate-600">
                <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>System tray & auto-start</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 relative">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-xs font-semibold text-emerald-800">Quick Install:</p>
                  <button
                    onClick={copyInstallCommand}
                    className="p-1 rounded hover:bg-emerald-100 transition-colors -mt-1"
                    title="Copy command"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-emerald-600" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-emerald-700 font-mono break-all">
                  curl -fsSL corridor.rknain.com/install-linux.sh | bash
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Installs to <code className="bg-slate-100 px-1 rounded text-[11px]">~/.local/bin</code> and adds to PATH
              </p>
            </div>

            <div className="space-y-2">
              <Link
                href="/downloads/linux"
                className="w-full bg-orange-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center justify-center"
              >
                <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Install Instructions
              </Link>
              <a
                href="/corridor"
                download="corridor"
                className="w-full bg-white text-orange-600 border border-orange-200 py-2 px-4 rounded-lg text-xs sm:text-sm font-medium hover:bg-orange-50 transition-colors flex items-center justify-center"
              >
                Direct Download
              </a>
            </div>
          </div>

          {/* Web App */}
          <div className="bg-gradient-to-br from-violet-50/50 to-white rounded-xl shadow-sm border border-violet-100/50 p-4 sm:p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6">
              <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-3 sm:mb-0 sm:mr-4">
                <Globe className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Web</h2>
                <p className="text-xs sm:text-sm text-slate-500">Browser-based</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              Use directly in your browser. No installation required.
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-start text-xs sm:text-sm text-slate-600">
                <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>All browsers supported</span>
              </div>
              <div className="flex items-start text-xs sm:text-sm text-slate-600">
                <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Real-time sync & history</span>
              </div>
            </div>

            <div className="bg-violet-50/50 border border-violet-100 rounded-lg p-3 mb-4">
              <p className="text-xs text-violet-700">
                <strong>Note:</strong> Works on desktop & mobile browsers.
              </p>
            </div>

            <Link
              href="/"
              className="w-full bg-violet-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors flex items-center justify-center"
            >
              <Globe className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Open Web App
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-2" />
            </Link>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/50 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-6 text-center">
            Getting Started
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-cyan-600">1</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">Download & Install</h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Choose your platform and download the app, or use the web version.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-emerald-600">2</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">Enter a Token</h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Create or enter an existing token to join a clipboard room.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-fuchsia-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-fuchsia-600">3</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">Start Syncing</h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Copy text on one device and paste it on any other device instantly.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 sm:mt-12 px-2">
          <p className="text-sm sm:text-base text-slate-600 mb-6 text-center">
            Need help? Check out our resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-between max-w-3xl mx-auto">
            <Link
              href="/resources/what-is-corridor"
              className="flex-1 group bg-gradient-to-br from-amber-50/50 to-orange-50/50 hover:from-amber-50 hover:to-orange-50 border border-amber-100 rounded-xl p-4 sm:p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">What is Corridor?</h3>
                  <p className="text-xs sm:text-sm text-slate-600">Learn about clipboard sync</p>
                </div>
                <ArrowRight className="h-5 w-5 text-amber-600 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
              </div>
            </Link>

            <Link
              href="/resources/how-to-use"
              className="flex-1 group bg-gradient-to-br from-cyan-50/50 to-blue-50/50 hover:from-cyan-50 hover:to-blue-50 border border-cyan-100 rounded-xl p-4 sm:p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">How to Use</h3>
                  <p className="text-xs sm:text-sm text-slate-600">Step-by-step setup guide</p>
                </div>
                <ArrowRight className="h-5 w-5 text-cyan-600 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

