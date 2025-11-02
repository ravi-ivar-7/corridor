import { FileText, AlertTriangle, CheckCircle, XCircle, Scale, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-slate-600">
            Last Updated: November 2, 2024
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Agreement to Terms</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            By using Corridor, you agree to these Terms of Service. If you don't agree, please don't use the service.
          </p>
          <p className="text-slate-700 leading-relaxed">
            Corridor is a clipboard synchronization service provided as-is for personal and professional use.
          </p>
        </div>

        {/* Service Description */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
          <div className="flex items-center mb-6">
            <CheckCircle className="h-6 w-6 text-emerald-600 mr-3" />
            <h2 className="text-2xl font-semibold text-slate-900">What Corridor Does</h2>
          </div>

          <div className="space-y-4">
            <p className="text-slate-700 leading-relaxed">
              Corridor provides real-time clipboard synchronization across your devices through:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>Native applications for Windows, Linux, and Android</li>
              <li>Web interface accessible from any browser</li>
              <li>WebSocket-based real-time synchronization</li>
              <li>Token-based access to shared clipboard "rooms"</li>
              <li>Temporary storage of clipboard history</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mt-4">
              Currently, only <strong>text content</strong> is supported for synchronization.
            </p>
          </div>
        </div>

        {/* Acceptable Use */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
          <div className="flex items-center mb-6">
            <Scale className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-semibold text-slate-900">Acceptable Use</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 text-emerald-500 mr-2" />
                You May:
              </h3>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Use Corridor for personal clipboard synchronization</li>
                <li>Use Corridor in your workplace or team (with proper authorization)</li>
                <li>Install Corridor on multiple devices you own or control</li>
                <li>Generate multiple tokens for different sync groups</li>
                <li>Share tokens with trusted individuals or your own devices</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
                You May Not:
              </h3>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Use Corridor to transmit illegal, harmful, or malicious content</li>
                <li>Attempt to access rooms/tokens that don't belong to you</li>
                <li>Reverse engineer, decompile, or attempt to extract source code</li>
                <li>Use automated systems to abuse or overload the service</li>
                <li>Attempt to disrupt, harm, or compromise the service infrastructure</li>
                <li>Use Corridor to spam, phish, or distribute malware</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </div>
          </div>
        </div>

        {/* User Responsibilities */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
          <div className="flex items-center mb-6">
            <ShieldAlert className="h-6 w-6 text-amber-600 mr-3" />
            <h2 className="text-2xl font-semibold text-slate-900">Your Responsibilities</h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">1. Token Security</h3>
              <p className="text-slate-700 leading-relaxed">
                You are responsible for keeping your tokens secure. Anyone with your token can access your clipboard room. Do not share tokens publicly or with untrusted parties.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">2. Content Responsibility</h3>
              <p className="text-slate-700 leading-relaxed">
                You are solely responsible for the content you sync through Corridor. Do not sync sensitive data like passwords, credit card numbers, or private keys unless you understand the security implications.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">3. Legal Compliance</h3>
              <p className="text-slate-700 leading-relaxed">
                You must comply with all applicable laws and regulations when using Corridor. If your use case involves regulated data (health records, financial data, etc.), ensure you have proper authorization and compliance measures.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">4. Device Security</h3>
              <p className="text-slate-700 leading-relaxed">
                Keep your devices secure. If a device with Corridor installed is lost or stolen, consider it a token compromise and generate a new token.
              </p>
            </div>
          </div>
        </div>

        {/* Service Availability */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
          <div className="flex items-center mb-6">
            <AlertTriangle className="h-6 w-6 text-orange-600 mr-3" />
            <h2 className="text-2xl font-semibold text-slate-900">Service Availability & Limitations</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> Corridor is provided "as-is" without warranties of any kind.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No Guarantees</h3>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>We don't guarantee 100% uptime or availability</li>
                <li>Synchronization may be delayed or fail due to network issues</li>
                <li>Data may be lost due to technical issues, infrastructure problems, or maintenance</li>
                <li>Features may change, be removed, or deprecated without notice</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Service Modifications</h3>
              <p className="text-slate-700 leading-relaxed">
                We reserve the right to modify, suspend, or discontinue Corridor at any time, with or without notice. We may also impose limits on storage, history size, or connection frequency.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer of Warranties */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Disclaimer of Warranties</h2>

          <div className="space-y-4">
            <p className="text-slate-700 leading-relaxed">
              Corridor is provided <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> without warranties of any kind, either express or implied, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>Warranties of merchantability or fitness for a particular purpose</li>
              <li>Warranties of non-infringement</li>
              <li>Warranties that the service will be uninterrupted, secure, or error-free</li>
              <li>Warranties regarding the accuracy, reliability, or completeness of data</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mt-4">
              You use Corridor at your own risk. We are not responsible for data loss, security breaches resulting from token compromise, or any damages arising from your use of the service.
            </p>
          </div>
        </div>

        {/* Limitation of Liability */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Limitation of Liability</h2>

          <div className="space-y-4">
            <p className="text-slate-700 leading-relaxed">
              To the maximum extent permitted by law, Corridor and its operators shall not be liable for:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>Any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of data, profits, revenue, or business opportunities</li>
              <li>Service interruptions or unavailability</li>
              <li>Unauthorized access to your data resulting from token compromise</li>
              <li>Any damages arising from your use or inability to use the service</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mt-4">
              This limitation applies regardless of the legal theory (contract, tort, negligence, etc.) and even if we've been advised of the possibility of such damages.
            </p>
          </div>
        </div>

        {/* Data and Privacy */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Data and Privacy</h2>

          <div className="space-y-4">
            <p className="text-slate-700 leading-relaxed">
              Your use of Corridor is also governed by our Privacy Policy. Key points:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>We store clipboard content temporarily for synchronization</li>
              <li>Data is isolated per token/room</li>
              <li>We don't collect personal information or use analytics</li>
              <li>You are responsible for not syncing sensitive data</li>
            </ul>
            <Link
              href="/privacy"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mt-4"
            >
              Read our Privacy Policy →
            </Link>
          </div>
        </div>

        {/* Termination */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Termination</h2>

          <div className="space-y-4">
            <p className="text-slate-700 leading-relaxed">
              You may stop using Corridor at any time by disconnecting your devices and abandoning your tokens.
            </p>
            <p className="text-slate-700 leading-relaxed">
              We reserve the right to terminate or suspend access to Corridor for any user who violates these terms or engages in abusive behavior, without prior notice.
            </p>
          </div>
        </div>

        {/* Changes to Terms */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Changes to Terms</h2>
          <p className="text-slate-700 leading-relaxed">
            We may update these Terms of Service from time to time. Changes will be posted on this page with an updated "Last Updated" date. Continued use of Corridor after changes constitutes acceptance of the new terms.
          </p>
        </div>

        {/* Governing Law */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Governing Law</h2>
          <p className="text-slate-700 leading-relaxed">
            These terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles. Any disputes shall be resolved through good faith negotiation or, if necessary, in appropriate courts.
          </p>
        </div>

        {/* Severability */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Severability</h2>
          <p className="text-slate-700 leading-relaxed">
            If any provision of these terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-sm p-4 text-white">
          <h2 className="text-2xl font-semibold mb-4">Questions About These Terms?</h2>
          <p className="leading-relaxed mb-6">
            If you have questions about these Terms of Service, please review our resources or contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/privacy"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/resources"
              className="inline-flex items-center justify-center px-6 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors"
            >
              Resources
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
