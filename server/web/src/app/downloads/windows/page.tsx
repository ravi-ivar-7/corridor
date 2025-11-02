import { Download, Monitor, CheckCircle, ArrowLeft, Play, Settings, Zap } from 'lucide-react';
import Link from 'next/link';

export default function WindowsDownloadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/downloads"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Downloads
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-sky-100 rounded-2xl mb-6">
            <Monitor className="h-16 w-16 text-sky-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Corridor for Windows
          </h1>
          <p className=" text-gray-600 max-w-2xl mx-auto">
            Native Windows application with system tray integration and automatic startup
          </p>
        </div>

        {/* Download Button */}
        <div className="bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-200 rounded-2xl p-4 mb-8 text-center shadow-sm">
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">Latest Version: 1.0.0</div>
            <div className="text-sm text-gray-500">Windows 10 or later • ~50MB</div>
          </div>
          <a
            href="/Corridor.exe"
            download="Corridor.exe"
            className="inline-flex items-center justify-center px-8 py-4 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 text-lg"
          >
            <Download className="h-6 w-6 mr-2" />
            Download for Windows
          </a>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Security Note:</strong> Self-signed certificate - Windows may show a warning. Click "More info" → "Run anyway"
            </p>
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'System Tray Integration', desc: 'Quick access from the Windows system tray' },
              { title: 'Auto-Start', desc: 'Automatically launches when Windows starts' },
              { title: 'Silent Mode', desc: 'Run in the background without notifications' },
              { title: 'No Installation', desc: 'Single executable file - no installer needed' },
              { title: 'Real-time Sync', desc: 'Instant clipboard synchronization' },
              { title: 'Clipboard History', desc: 'Access up to 100 recent items' }
            ].map((feature, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">{feature.title}</div>
                  <div className="text-sm text-gray-600">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Installation Steps */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Installation & Setup</h2>
          <div className="space-y-6">
            {[
              {
                step: '1',
                title: 'Download',
                desc: 'Click the download button above to get Corridor.exe',
                icon: Download,
                color: 'fuchsia'
              },
              {
                step: '2',
                title: 'Run the Application',
                desc: 'Double-click Corridor.exe to launch. Windows may show a SmartScreen warning - click "More info" then "Run anyway"',
                icon: Play,
                color: 'cyan'
              },
              {
                step: '3',
                title: 'Configure Settings',
                desc: 'On first run, enter your token, choose mode (interactive/silent), and configure auto-start',
                icon: Settings,
                color: 'amber'
              },
              {
                step: '4',
                title: 'Start Syncing',
                desc: 'Click "Save and Start" - your clipboard will now sync across all devices!',
                icon: Zap,
                color: 'emerald'
              }
            ].map((step) => (
              <div key={step.step} className="flex items-start">
                <div className={`w-12 h-12 bg-${step.color}-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0`}>
                  <span className={`text-${step.color}-600 font-bold text-lg`}>{step.step}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Requirements */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">System Requirements</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Minimum</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-gray-400 mr-2" /> Windows 10 (64-bit)</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-gray-400 mr-2" /> 4GB RAM</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-gray-400 mr-2" /> 100MB free disk space</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-gray-400 mr-2" /> Internet connection</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Recommended</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-500 mr-2" /> Windows 11 (64-bit)</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-500 mr-2" /> 8GB RAM or more</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-500 mr-2" /> SSD storage</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-500 mr-2" /> Stable broadband</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-amber-900 mb-2">Self-Signed Certificate</h3>
              <p className="text-sm text-amber-800 mb-2">
                This executable is signed with a self-signed certificate. Windows SmartScreen may show a warning
                because the app is not distributed via the Microsoft Store.
              </p>
              <p className="text-sm text-amber-800">
                <strong>This is expected and safe.</strong> Click "More info" then "Run anyway" to proceed.
              </p>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Troubleshooting</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Windows SmartScreen Warning</h3>
              <p className="text-sm text-gray-600">
                Click "More info" and then "Run anyway". This warning appears because Corridor is not distributed through the Microsoft Store.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Connection Issues</h3>
              <p className="text-sm text-gray-600">
                Ensure your firewall allows Corridor to access the internet. Check your token is correct and that you have a stable internet connection.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">System Tray Icon Missing</h3>
              <p className="text-sm text-gray-600">
                Right-click the Corridor executable and run as administrator. Ensure the app is running in interactive mode (not silent mode).
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
