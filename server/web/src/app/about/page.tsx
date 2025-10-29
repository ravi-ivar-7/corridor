import { Clipboard, Zap, Smartphone } from 'lucide-react';

const features = [
  {
    icon: <Clipboard className="h-6 w-6 text-emerald-500" />,
    title: 'Simple Sharing',
    description: 'Share text between devices using a simple token-based system.'
  },
  {
    icon: <Smartphone className="h-6 w-6 text-amber-500" />,
    title: 'Cross-Device',
    description: 'Works across different devices as long as they can access the web interface.'
  },
  {
    icon: <Zap className="h-6 w-6 text-rose-500" />,
    title: 'Quick Setup',
    description: 'No installation required, just open in your browser and start syncing.'
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
            Real-time clipboard synchronization across devices
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
          <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">How It Works</h2>
              
              <div className="space-y-6">
                {[
                  {
                    step: '1',
                    title: 'Enter a Token',
                    description: 'Create or enter an existing token on the home page.',
                    color: 'from-emerald-500 to-teal-500'
                  },
                  {
                    step: '2',
                    title: 'Share the Token',
                    description: 'Use the same token on another device.',
                    color: 'from-emerald-500 to-teal-500'
                  },
                  {
                    step: '3',
                    title: 'Sync Text',
                    description: 'Text copied on one device appears in the history of all devices with the same token.',
                    color: 'from-emerald-500 to-teal-500'
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r ${item.color} text-white font-medium text-xs mr-3`}>
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-gray-500 text-sm mt-0.5">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-slate-50 rounded-lg p-4 border border-slate-100">
                <div className="flex">
                  <div className="flex-shrink-0 mt-0.5">
                    <Clipboard className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-slate-600">
                      This is a real-time clipboard sharing tool. Any text you copy while on a token&apos;s page will be visible to anyone else using the same token.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

     
      </div>
    </div>
  );
}
