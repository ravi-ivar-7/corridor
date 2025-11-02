import { Clipboard, Zap, Smartphone, Repeat, Download, Laptop, Monitor, Globe, Shield, History, Clock, Wifi } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About Corridor
          </h1>
          <p className=" text-gray-600 max-w-3xl mx-auto leading-relaxed">
            A universal clipboard synchronization solution that seamlessly connects all your devices.
            Copy on one device, paste on another - instantly and effortlessly.
          </p>
        </div>

        {/* Platforms Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Available Everywhere</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Windows', icon: Monitor, bgColor: 'bg-sky-50', iconColor: 'text-sky-600', borderColor: 'border-sky-100', desc: 'Native App' },
              { name: 'Linux', icon: Monitor, bgColor: 'bg-orange-50', iconColor: 'text-orange-600', borderColor: 'border-orange-100', desc: 'Native App' },
              { name: 'Android', icon: Smartphone, bgColor: 'bg-emerald-50', iconColor: 'text-emerald-600', borderColor: 'border-emerald-100', desc: 'Mobile App' },
              { name: 'Web', icon: Globe, bgColor: 'bg-violet-50', iconColor: 'text-violet-600', borderColor: 'border-violet-100', desc: 'Any Browser' }
            ].map((platform) => (
              <div
                key={platform.name}
                className={`bg-white rounded-xl border ${platform.borderColor} shadow-sm hover:shadow-md transition-all duration-300 p-6 text-center group hover:-translate-y-1`}
              >
                <div className={`inline-flex p-4 ${platform.bgColor} rounded-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  <platform.icon className={`h-8 w-8 ${platform.iconColor}`} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{platform.name}</h3>
                <p className="text-sm text-gray-500">{platform.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose Corridor?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Real-time WebSocket sync ensures your clipboard updates instantly across all devices.',
                bgColor: 'bg-amber-50',
                iconColor: 'text-amber-600',
                borderColor: 'border-amber-100'
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'Token-based authentication keeps your clipboard data private. No accounts needed.',
                bgColor: 'bg-emerald-50',
                iconColor: 'text-emerald-600',
                borderColor: 'border-emerald-100'
              },
              {
                icon: History,
                title: 'Clipboard History',
                description: 'Access up to 100 recent clipboard items from any connected device.',
                bgColor: 'bg-cyan-50',
                iconColor: 'text-cyan-600',
                borderColor: 'border-cyan-100'
              },
              {
                icon: Wifi,
                title: 'Offline Queue',
                description: 'Items copied while offline are automatically synced when you reconnect.',
                bgColor: 'bg-violet-50',
                iconColor: 'text-violet-600',
                borderColor: 'border-violet-100'
              },
              {
                icon: Clock,
                title: 'Always Available',
                description: 'Cloud-based storage means your clipboard is accessible anytime, anywhere.',
                bgColor: 'bg-indigo-50',
                iconColor: 'text-indigo-600',
                borderColor: 'border-indigo-100'
              },
              {
                icon: Smartphone,
                title: 'Cross-Platform',
                description: 'Works seamlessly across Windows, Linux, Android, and web browsers.',
                bgColor: 'bg-rose-50',
                iconColor: 'text-rose-600',
                borderColor: 'border-rose-100'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border ${feature.borderColor}`}
              >
                <div className={`inline-flex p-3 ${feature.bgColor} rounded-xl mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                icon: Download,
                title: 'Choose Your Platform',
                description: 'Download native apps for Windows, Linux, or Android - or use directly in your browser.',
                bgColor: 'bg-fuchsia-50',
                iconColor: 'text-fuchsia-600',
                borderColor: 'border-fuchsia-100',
                numberBg: 'bg-fuchsia-600'
              },
              {
                step: '2',
                icon: Laptop,
                title: 'Enter a Token',
                description: 'Generate a unique token or use an existing one to connect all your devices securely.',
                bgColor: 'bg-cyan-50',
                iconColor: 'text-cyan-600',
                borderColor: 'border-cyan-100',
                numberBg: 'bg-cyan-600'
              },
              {
                step: '3',
                icon: Repeat,
                title: 'Start Syncing',
                description: 'Copy text on any device and it instantly appears on all your connected devices.',
                bgColor: 'bg-emerald-50',
                iconColor: 'text-emerald-600',
                borderColor: 'border-emerald-100',
                numberBg: 'bg-emerald-600'
              }
            ].map((step) => (
              <div key={step.step} className="relative">
                <div className={`bg-white border ${step.borderColor} rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 h-full`}>
                  <div className={`absolute -top-4 -left-4 w-12 h-12 ${step.numberBg} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                    {step.step}
                  </div>
                  <div className={`inline-flex p-4 ${step.bgColor} rounded-2xl mb-4 mt-4`}>
                    <step.icon className={`h-8 w-8 ${step.iconColor}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-xl mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-fuchsia-50 to-pink-50 border-2 border-fuchsia-100 rounded-2xl p-8 md:p-12 text-center shadow-sm">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Sync Your Clipboard?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of users enjoying seamless clipboard synchronization across all their devices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/downloads"
              className="inline-flex items-center justify-center px-8 py-4 bg-fuchsia-600 text-white rounded-xl font-semibold hover:bg-fuchsia-700 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105"
            >
              <Download className="mr-2 h-5 w-5" />
              Download Now
            </a>
            <a
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-fuchsia-600 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 border-2 border-fuchsia-200 hover:border-fuchsia-300"
            >
              Try Web Version
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
