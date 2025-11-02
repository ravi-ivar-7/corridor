import { Shield, Database, Lock, Eye, Server, Clock } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-slate-600">
            Last Updated: November 2, 2024
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Introduction</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            Corridor is a clipboard synchronization service that allows you to share clipboard content across your devices using a shared token. This privacy policy explains how we handle your data.
          </p>
          <p className="text-slate-700 leading-relaxed">
            We are committed to transparency. Corridor operates on a simple principle: <strong>we only store what's necessary for the service to function</strong>.
          </p>
        </div>

        {/* What We Collect */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
          <div className="flex items-center mb-6">
            <Database className="h-6 w-6 text-sky-600 mr-3" />
            <h2 className="text-2xl font-semibold text-slate-900">What Data We Collect</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">1. Clipboard Content</h3>
              <p className="text-slate-700 leading-relaxed">
                We temporarily store the text content you copy to your clipboard. This is essential for syncing across your devices. Currently, only text content is supported.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">2. Room Tokens</h3>
              <p className="text-slate-700 leading-relaxed">
                You create or use a token to access a "room" where clipboard data is synchronized. Tokens are used to identify which devices belong to the same sync group.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">3. Connection Metadata</h3>
              <p className="text-slate-700 leading-relaxed">
                We maintain basic connection information (WebSocket connections) to enable real-time synchronization. This includes timestamps of clipboard updates.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>We DO NOT collect:</strong> Personal information, email addresses, device identifiers, IP addresses (beyond temporary connection handling), or any analytics data.
              </p>
            </div>
          </div>
        </div>

        {/* How We Use Data */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
          <div className="flex items-center mb-6">
            <Server className="h-6 w-6 text-violet-600 mr-3" />
            <h2 className="text-2xl font-semibold text-slate-900">How We Use Your Data</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-violet-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p className="text-slate-700 leading-relaxed">
                <strong>Clipboard Synchronization:</strong> Your clipboard content is transmitted in real-time to all devices connected to the same token/room.
              </p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-violet-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p className="text-slate-700 leading-relaxed">
                <strong>History Storage:</strong> We maintain a limited history of clipboard items (configurable per room) to allow you to access recently synced content.
              </p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-violet-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p className="text-slate-700 leading-relaxed">
                <strong>Service Operation:</strong> Connection metadata is used solely to maintain WebSocket connections and ensure reliable synchronization.
              </p>
            </div>
          </div>
        </div>

        {/* Data Storage */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
          <div className="flex items-center mb-6">
            <Lock className="h-6 w-6 text-emerald-600 mr-3" />
            <h2 className="text-2xl font-semibold text-slate-900">Data Storage & Security</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Infrastructure</h3>
              <p className="text-slate-700 leading-relaxed mb-3">
                Corridor runs on Cloudflare Workers with Durable Objects storage. Your data is stored on Cloudflare's global infrastructure.
              </p>
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                <p className="text-sm text-sky-800">
                  <strong>Note:</strong> We use Cloudflare's infrastructure. Their privacy policy and security measures also apply. Learn more at <a href="https://www.cloudflare.com/privacypolicy/" className="underline hover:text-sky-900" target="_blank" rel="noopener noreferrer">Cloudflare Privacy Policy</a>.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Data Retention</h3>
              <p className="text-slate-700 leading-relaxed">
                Clipboard history is stored temporarily and is automatically cleaned when:
              </p>
              <ul className="list-disc list-inside text-slate-700 mt-2 space-y-1 ml-4">
                <li>The history limit for a room is exceeded (older items are deleted)</li>
                <li>A room becomes inactive (no connections for extended periods)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Security Measures</h3>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>All communication uses encrypted WebSocket connections (WSS)</li>
                <li>Token-based access control (only devices with the correct token can access a room)</li>
                <li>No authentication or user accounts (reducing attack surface)</li>
                <li>Data is isolated per room/token</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Your Responsibilities */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
          <div className="flex items-center mb-6">
            <Eye className="h-6 w-6 text-fuchsia-600 mr-3" />
            <h2 className="text-2xl font-semibold text-slate-900">Your Responsibilities</h2>
          </div>

          <div className="space-y-4">
            <p className="text-slate-700 leading-relaxed">
              <strong>Token Security:</strong> Anyone with your token can access your clipboard room. Keep your tokens private and only share them with devices you control or people you trust.
            </p>
            <p className="text-slate-700 leading-relaxed">
              <strong>Sensitive Data:</strong> Avoid copying sensitive information (passwords, credit card numbers, private keys) to your clipboard while Corridor is running, as it will be synced and stored temporarily.
            </p>
            <p className="text-slate-700 leading-relaxed">
              <strong>Use New Tokens:</strong> Generate new tokens periodically for enhanced security. Old tokens can be abandoned.
            </p>
          </div>
        </div>

        {/* Third Parties */} 
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
          <div className="flex items-center mb-6">
            <Clock className="h-6 w-6 text-orange-600 mr-3" />
            <h2 className="text-2xl font-semibold text-slate-900">Third-Party Services</h2>
          </div>

          <div className="space-y-4">
            <p className="text-slate-700 leading-relaxed">
              <strong>Cloudflare:</strong> Our infrastructure provider. They handle hosting, networking, and storage.
            </p>
            <p className="text-slate-700 leading-relaxed">
              <strong>No Analytics or Tracking:</strong> We do not use Google Analytics, Facebook Pixel, or any other tracking services.
            </p>
            <p className="text-slate-700 leading-relaxed">
              <strong>No Advertising:</strong> We do not share your data with advertisers or data brokers.
            </p>
          </div>
        </div>

        {/* Your Rights */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Your Rights</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Data Deletion</h3>
              <p className="text-slate-700 leading-relaxed">
                Since we don't maintain user accounts, you can effectively delete your data by:
              </p>
              <ul className="list-disc list-inside text-slate-700 mt-2 space-y-1 ml-4">
                <li>Disconnecting all devices from your token</li>
                <li>Abandoning the token (it will eventually be cleaned up due to inactivity)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Data Access</h3>
              <p className="text-slate-700 leading-relaxed">
                You can access your clipboard history through any connected device using your token.
              </p>
            </div>
          </div>
        </div>

        {/* Changes to Policy */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Changes to This Policy</h2>
          <p className="text-slate-700 leading-relaxed">
            We may update this privacy policy from time to time. Changes will be posted on this page with an updated "Last Updated" date. Continued use of Corridor after changes constitutes acceptance of the new policy.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-sm p-4 text-white">
          <h2 className="text-2xl font-semibold mb-4">Questions?</h2>
          <p className="leading-relaxed mb-4">
            If you have questions about this privacy policy or how we handle your data, please contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/resources/what-is-corridor"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-colors"
            >
              Learn More About Corridor
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
