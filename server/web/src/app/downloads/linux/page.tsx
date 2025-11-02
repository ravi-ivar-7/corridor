import { Download, Monitor, CheckCircle, ArrowLeft, Terminal, Play, Settings, Zap } from 'lucide-react';
import Link from 'next/link';

export default function LinuxDownloadPage() {
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
          <div className="inline-flex items-center justify-center p-4 bg-orange-100 rounded-2xl mb-6">
            <Terminal className="h-16 w-16 text-orange-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Corridor for Linux
          </h1>
          <p className=" text-gray-600 max-w-2xl mx-auto">
            Native Linux application with system tray integration for all major distributions
          </p>
        </div>

        {/* Download Button */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-4 mb-8 text-center shadow-sm">
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">Latest Version: 1.0.0</div>
            <div className="text-sm text-gray-500">glibc 2.31+ • Ubuntu 20.04+ • ~3MB</div>
          </div>
          <a
            href="/Corridor"
            download="Corridor"
            className="inline-flex items-center justify-center px-8 py-4 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 text-lg"
          >
            <Download className="h-6 w-6 mr-2" />
            Download for Linux
          </a>
          <div className="mt-4 text-xs text-gray-500">
            Standalone binary • x86_64 architecture
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'System Tray Integration', desc: 'Integrates with GNOME, KDE, and other DEs' },
              { title: 'Auto-Start Support', desc: 'Desktop file for automatic startup' },
              { title: 'X11 & Wayland', desc: 'Works on both display servers' },
              { title: 'Setup Wizard', desc: 'Easy configuration on first run with GUI dialogs' },
              { title: 'Offline Queue', desc: 'Items synced automatically when reconnected' },
              { title: 'Clipboard History', desc: 'Access up to 100 recent clipboard items' }
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
                desc: 'Download the Corridor binary from the button above',
                icon: Download,
                color: 'fuchsia'
              },
              {
                step: '2',
                title: 'Make Executable',
                desc: 'Open terminal and run: chmod +x Corridor',
                icon: Terminal,
                color: 'cyan',
                code: 'chmod +x Corridor'
              },
              {
                step: '3',
                title: 'Run the Application',
                desc: 'Execute: ./Corridor - A setup dialog will appear on first run',
                icon: Play,
                color: 'amber',
                code: './Corridor'
              },
              {
                step: '4',
                title: 'Configure Settings',
                desc: 'Enter your token, choose mode, and enable auto-start in the setup wizard',
                icon: Settings,
                color: 'violet'
              },
              {
                step: '5',
                title: 'Start Syncing',
                desc: 'Click "Save and Start" - check system tray for the Corridor icon',
                icon: Zap,
                color: 'emerald'
              }
            ].map((step) => (
              <div key={step.step} className="flex items-start">
                <div className={`w-12 h-12 bg-${step.color}-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0`}>
                  <span className={`text-${step.color}-600 font-bold text-lg`}>{step.step}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{step.desc}</p>
                  {step.code && (
                    <code className="block bg-gray-900 text-gray-100 px-4 py-2 rounded-lg text-sm font-mono">
                      $ {step.code}
                    </code>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Requirements */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Compatibility</h2>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Supported Distributions</h3>
            <div className="grid md:grid-cols-2 gap-2">
              {[
                'Ubuntu 20.04+, 22.04, 24.04',
                'Debian 11+ (Bullseye, Bookworm)',
                'Linux Mint 20+',
                'Pop!_OS 20.04+',
                'Fedora 35+',
                'openSUSE Leap 15.3+'
              ].map((distro, i) => (
                <div key={i} className="flex items-center text-gray-600 text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0" />
                  {distro}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Not Compatible</h3>
            <div className="space-y-1">
              {[
                'Ubuntu 18.04 or older (requires libssl.so.3)',
                'Debian 10 or older',
                'CentOS 7, RHEL 7',
                'Alpine Linux (uses musl, not glibc)',
                '32-bit systems (x86)',
                'ARM/ARM64 architectures (currently)'
              ].map((item, i) => (
                <div key={i} className="flex items-center text-gray-600 text-sm">
                  <span className="text-red-500 mr-2">✗</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Requirements</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center"><CheckCircle className="h-4 w-4 text-gray-400 mr-2" /> glibc 2.31 or newer</li>
              <li className="flex items-center"><CheckCircle className="h-4 w-4 text-gray-400 mr-2" /> OpenSSL 3.x (libssl.so.3)</li>
              <li className="flex items-center"><CheckCircle className="h-4 w-4 text-gray-400 mr-2" /> Python 3.8+ with tkinter (for setup dialogs)</li>
              <li className="flex items-center"><CheckCircle className="h-4 w-4 text-gray-400 mr-2" /> X11 or Wayland display server</li>
              <li className="flex items-center"><CheckCircle className="h-4 w-4 text-gray-400 mr-2" /> System tray support (optional)</li>
            </ul>
          </div>
        </div>

        {/* Auto-Start Setup */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Auto-Start Configuration</h2>
          <p className="text-gray-600 mb-4">
            The setup wizard creates an auto-start entry automatically. Alternatively, you can set it up manually:
          </p>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <div className="mb-2"># Create autostart directory</div>
            <div>$ mkdir -p ~/.config/autostart</div>
            <div className="mt-4 mb-2"># Create desktop file</div>
            <div>$ cat &gt; ~/.config/autostart/corridor.desktop &lt;&lt;EOF</div>
            <div>[Desktop Entry]</div>
            <div>Type=Application</div>
            <div>Name=Corridor</div>
            <div>Exec=/path/to/Corridor --autostart</div>
            <div>Hidden=false</div>
            <div>NoDisplay=false</div>
            <div>X-GNOME-Autostart-enabled=true</div>
            <div>EOF</div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Troubleshooting</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Setup dialog not appearing</h3>
              <p className="text-sm text-gray-600 mb-2">
                Install Python 3 with tkinter:
              </p>
              <code className="block bg-gray-900 text-gray-100 px-4 py-2 rounded-lg text-sm font-mono">
                $ sudo apt install python3-tk
              </code>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">System tray icon missing</h3>
              <p className="text-sm text-gray-600 mb-2">
                For GNOME, install the AppIndicator extension:
              </p>
              <code className="block bg-gray-900 text-gray-100 px-4 py-2 rounded-lg text-sm font-mono">
                $ sudo apt install gnome-shell-extension-appindicator
              </code>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Permission denied error</h3>
              <p className="text-sm text-gray-600 mb-2">
                Make sure the binary is executable:
              </p>
              <code className="block bg-gray-900 text-gray-100 px-4 py-2 rounded-lg text-sm font-mono">
                $ chmod +x Corridor
              </code>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Connection issues</h3>
              <p className="text-sm text-gray-600">
                Check logs with: RUST_LOG=debug ./Corridor
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
