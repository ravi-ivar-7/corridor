import { Download, Monitor, Globe, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DownloadsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Downloads
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get Corridor on your preferred platform and start syncing your clipboard across devices.
          </p>
        </div>

        {/* Download Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Windows Client */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Monitor className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Windows Client</h2>
                <p className="text-sm text-gray-500">Desktop application</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">
              Download the native Windows application for seamless clipboard synchronization. 
              Runs in the background and automatically syncs your clipboard across all devices.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>Runs silently in the background</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>Automatic startup with Windows</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>System tray integration</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>No installation required</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 mb-2">
                <strong>System Requirements:</strong>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Windows 10 or later</li>
                <li>• .NET 9.0 Runtime (included)</li>
                <li>• Internet connection</li>
              </ul>
            </div>

            <a 
              href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://corridor-web.vercel.app'}/downloads`}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Download className="h-5 w-5 mr-2" />
              Download for Windows
            </a>
          </div>

          {/* Web App */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Web App</h2>
                <p className="text-sm text-gray-500">Browser-based interface</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">
              Use Corridor directly in your web browser. No installation required - 
              just open the link and start syncing your clipboard instantly.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>Works on any device with a browser</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>No installation required</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>Real-time synchronization</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>Clipboard history</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 mb-2">
                <strong>Compatible Browsers:</strong>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Chrome, Firefox, Safari, Edge</li>
                <li>• Mobile browsers supported</li>
                <li>• HTTPS required for clipboard access</li>
              </ul>
            </div>

            <Link 
              href="/"
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <Globe className="h-5 w-5 mr-2" />
              Open Web App
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Getting Started
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Download & Install</h3>
              <p className="text-sm text-gray-600">
                Download the Windows client or open the web app in your browser.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-green-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Enter a Token</h3>
              <p className="text-sm text-gray-600">
                Create or enter an existing token to join a clipboard room.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Start Syncing</h3>
              <p className="text-sm text-gray-600">
                Copy text on one device and paste it on any other device instantly.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Need help getting started? Check out our documentation or contact support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/about"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Learn More
            </Link>
            <span className="hidden sm:block text-gray-300">•</span>
            <Link 
              href="/resources"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Documentation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

