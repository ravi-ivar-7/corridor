import { Clipboard, Zap, Smartphone, Repeat ,Download, Laptop} from 'lucide-react';

const features = [
  {
    icon: <Zap className="h-6 w-6 text-emerald-500" />,
    title: 'Real-time Sync',
    description: 'Instantly sync text between devices using a simple token-based system.'
  },
  {
    icon: <Smartphone className="h-6 w-6 text-amber-500" />,
    title: 'Cross-Device',
    description: 'Works across different devices as long as they can access the same token.'
  },
  {
    icon: <Repeat className="h-6 w-6 text-rose-500" />,
    title: 'Quick Setup',
    description: 'Download the Windows executable or use the web interface in your browser.'
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Corridor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            This is a real-time clipboard sharing tool. Any text you copy while on a token&apos;s page will be visible to anyone else using the same token.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Features */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Features</h2>
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start p-4 bg-white rounded-lg shadow-sm hover:shadow transition-all duration-200"
              >
                <div className="flex-shrink-0 p-2 bg-emerald-50 rounded-md mr-3">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{feature.title}</h3>
                  <p className="text-gray-500 text-sm mt-0.5">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - How It Works */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">How It Works</h2>
            {[
              {
                icon: <Download className="h-6 w-6 text-blue-500" />,
                title: 'Download & Install',
                description: 'Download the Windows executable or use the web interface in your browser.'
              },
              {
                icon: <Laptop className="h-6 w-6 text-purple-500" />,
                title: 'Enter a Token',
                description: 'Create or enter an existing token to join a clipboard room.'
              },
              {
                icon: <Repeat className="h-6 w-6 text-green-500" />,
                title: 'Start Syncing',
                description: 'Text copied on one device appears instantly on all devices with the same token.'
              }
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-start p-4 bg-white rounded-lg shadow-sm hover:shadow transition-all duration-200"
              >
                <div className="flex-shrink-0 p-2 bg-blue-50 rounded-md mr-3">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <p className="text-gray-500 text-sm mt-0.5">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
}
