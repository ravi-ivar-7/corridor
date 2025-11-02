import { Download, Smartphone, CheckCircle, ArrowLeft, Play, Settings, Zap, Shield } from 'lucide-react';
import Link from 'next/link';

export default function AndroidDownloadPage() {
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
          <div className="inline-flex items-center justify-center p-4 bg-emerald-100 rounded-2xl mb-6">
            <Smartphone className="h-16 w-16 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Corridor for Android
          </h1>
          <p className=" text-gray-600 max-w-2xl mx-auto">
            Mobile clipboard synchronization app with background service and automatic syncing
          </p>
        </div>

        {/* Download Button */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-4 mb-8 text-center shadow-sm">
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">Latest Version: 1.0.0</div>
            <div className="text-sm text-gray-500">Android 8.0+ (API 26) • ~12MB</div>
          </div>
          <a
            href="/Corridor.apk"
            download="Corridor.apk"
            className="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 text-lg"
          >
            <Download className="h-6 w-6 mr-2" />
            Download APK
          </a>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Installation:</strong> Enable "Install from unknown sources" in Settings → Security or Settings → Apps
            </p>
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'Background Service', desc: 'Runs continuously in the background' },
              { title: 'Auto-Start on Boot', desc: 'Automatically starts when phone restarts' },
              { title: 'Clipboard Monitoring', desc: 'Detects and syncs clipboard changes instantly' },
              { title: 'Material Design UI', desc: 'Clean, modern Android interface' },
              { title: 'Persistent Notification', desc: 'Shows sync status in notification bar' },
              { title: 'Clipboard History', desc: 'View and restore recent clipboard items' }
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
                title: 'Download APK',
                desc: 'Download Corridor.apk to your Android device',
                icon: Download,
                color: 'fuchsia'
              },
              {
                step: '2',
                title: 'Enable Unknown Sources',
                desc: 'Go to Settings → Security → Allow installation from unknown sources (or approve the install prompt)',
                icon: Shield,
                color: 'amber'
              },
              {
                step: '3',
                title: 'Install the App',
                desc: 'Open the downloaded APK file and tap "Install"',
                icon: Play,
                color: 'cyan'
              },
              {
                step: '4',
                title: 'Grant Permissions',
                desc: 'Allow clipboard access and notification permissions when prompted',
                icon: Settings,
                color: 'violet'
              },
              {
                step: '5',
                title: 'Enter Token & Start',
                desc: 'Open Corridor, enter your sync token, and tap "Start Sync"',
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

        {/* Security Notice */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Shield className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-amber-900 mb-2">APK Installation Notice</h3>
              <p className="text-sm text-amber-800 mb-3">
                Android will show a security warning when installing APK files from outside the Google Play Store.
                This is a standard Android security feature.
              </p>
              <div className="space-y-2">
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    <strong>Enable "Install from unknown sources"</strong> in Settings → Security, or approve the install when prompted
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    <strong>APK is signed</strong> - The digital signature can be verified for authenticity
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    <strong>This is safe</strong> - The warning is expected for sideloaded apps
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Requirements */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">System Requirements</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Minimum</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-gray-400 mr-2" /> Android 8.0 (API 26) or later</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-gray-400 mr-2" /> 2GB RAM</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-gray-400 mr-2" /> 50MB free storage</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-gray-400 mr-2" /> Internet connection</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Recommended</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-500 mr-2" /> Android 11 or newer</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-500 mr-2" /> 4GB RAM or more</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-500 mr-2" /> WiFi or mobile data</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-500 mr-2" /> Battery optimization disabled</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Required Permissions</h2>
          <div className="space-y-3">
            {[
              {
                name: 'Clipboard Access',
                reason: 'To read and monitor clipboard changes for synchronization'
              },
              {
                name: 'Internet',
                reason: 'To connect to the sync server and transmit clipboard data'
              },
              {
                name: 'Foreground Service',
                reason: 'To run the sync service continuously in the background'
              },
              {
                name: 'Boot Completed',
                reason: 'To automatically start the sync service when your device restarts'
              },
              {
                name: 'Post Notifications',
                reason: 'To show sync status and connection alerts'
              }
            ].map((perm, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">{perm.name}</div>
                  <div className="text-sm text-gray-600">{perm.reason}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Troubleshooting</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Cannot install APK</h3>
              <p className="text-sm text-gray-600">
                Go to Settings → Security → Enable "Install from unknown sources" or "Allow from this source" when prompted during installation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">App stops syncing in background</h3>
              <p className="text-sm text-gray-600">
                Disable battery optimization for Corridor: Settings → Battery → Battery Optimization → Select "All apps" → Find Corridor → Don't optimize.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Clipboard not syncing</h3>
              <p className="text-sm text-gray-600">
                Ensure clipboard permissions are granted. Go to Settings → Apps → Corridor → Permissions and verify all required permissions are allowed.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Connection issues</h3>
              <p className="text-sm text-gray-600">
                Check your internet connection. Verify your token is correct. Try stopping and restarting the sync service from the app.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
