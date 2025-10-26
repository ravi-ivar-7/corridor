'use client';

import React, { useState } from 'react';
import { Clipboard, Copy, Download, Terminal, Settings, Check, Key, Server, Cpu, Zap, BadgeQuestionMark } from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    title: 'Get Your Token',
    description: 'Visit sync.rknain.com to generate your unique authentication token.',
    icon: <Key className="w-5 h-5" />,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Download the Executable',
    description: 'Download the latest sync.exe from the releases page.',
    icon: <Download className="w-5 h-5" />,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    title: 'Run with Token',
    description: 'Run the executable with your token: `./sync.exe -h sync.rknain.com -t YOUR_TOKEN -i 10000 -q`',
    icon: <Terminal className="w-5 h-5" />,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
  },
  {
    title: 'Set Up as Background Service',
    description: 'Create a VBS script to run the client in the background automatically.',
    icon: <Server className="w-5 h-5" />,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
  },
];

const setupMethods = [
  {
    title: 'Manual Run',
    description: 'Run the executable directly from Command Prompt',
    command: './sync.exe -h sync.rknain.com -t YOUR_TOKEN -i 10000 -q',
    icon: <Terminal className="w-5 h-5 text-blue-500" />,
  },
  {
    title: 'VBS Script',
    description: 'Run as a background service using a VBS script',
    command: 'Set WshShell = CreateObject(\"WScript.Shell\")\nWshShell.Run \"""" & CreateObject(\"WScript.ScriptFullName\").ParentFolder.Path & "\\\\sync.exe\" & \"\"" -h sync.rknain.com -t YOUR_TOKEN -i 10000 -q\", 0, False',
    icon: <Server className="w-5 h-5 text-purple-500" />,
  },
  {
    title: 'Task Scheduler',
    description: 'Run on system startup using Task Scheduler',
    command: 'New-ScheduledTaskAction -Execute \"./sync.exe\" -Argument \"-h sync.rknain.com -t YOUR_TOKEN -i 10000 -q\"',
    icon: <Cpu className="w-5 h-5 text-emerald-500" />,
  },
];

const faqs = [
  {
    question: 'How do I get my token?',
    answer: 'Visit sync.rknain.com to generate your unique authentication token. This token is required to sync your clipboard across devices.'
  },
  {
    question: 'Is my clipboard data secure?',
    answer: 'Yes, all clipboard data is encrypted in transit. Only devices with your unique token can access your clipboard data.'
  },
  {
    question: 'How do I run it in the background?',
    answer: 'You can use a VBS script or Task Scheduler to run the client as a background service. Detailed instructions are provided below.'
  },
  {
    question: 'What does the -q flag do?',
    answer: 'The -q flag runs the client in quiet mode, which disables console output and runs the application silently in the background.'
  },
];

export default function HowToUse() {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="relative">
            <div className="absolute -top-2 -left-4 w-24 h-24 bg-blue-100/50 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
            <div className="absolute -bottom-2 -right-4 w-24 h-24 bg-purple-100/50 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                How to Use Clipboard Sync
              </h1>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-12">
          <div className="p-6 sm:p-8">
            <div className="space-y-10">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${step.bgColor} flex items-center justify-center mr-4 mt-0.5`}>
                    {React.cloneElement(step.icon, { className: `w-5 h-5 ${step.color}` })}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{step.title}</h3>
                    <p className="text-slate-600 mt-1">{step.description}</p>
                  </div>
                </div>
              ))}

              <div className="pt-6 border-t border-slate-100">
                <h2 className="text-xl font-semibold text-slate-800 mb-6">Setup Methods</h2>
                <div className="space-y-2 sm:space-y-4">
                  {setupMethods.map((method, index) => (
                    <div key={index} className="py-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-md bg-white flex items-center justify-center shadow-sm">
                          {method.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-slate-800">{method.title}</h3>
                          <p className="text-slate-600 text-sm mb-2">{method.description}</p>
                          <div className="bg-slate-800/95 rounded-md p-1.5 overflow-hidden">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-slate-400 text-[11px] font-mono">Command</span>
                              <button 
                                onClick={() => handleCopy(method.command.replace(/\\"/g, '"'))}
                                className="text-slate-400 hover:text-white transition-colors text-[11px] flex items-center whitespace-nowrap px-2 py-0.5 bg-slate-700/50 rounded"
                              >
                                {copied ? (
                                  <>
                                    <Check className="w-2.5 h-2.5 mr-1 text-green-400 flex-shrink-0" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-2.5 h-2.5 mr-1 flex-shrink-0" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="w-full overflow-x-auto">
                              <pre className="text-green-400 font-mono text-sm py-1 pr-2">
                                <code className="whitespace-nowrap">{method.command}</code>
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h2 className="text-xl font-semibold text-slate-800 mb-6">Detailed Setup Instructions</h2>
                
                <div className="space-y-8">
                  {/* Step 1: Get Token */}
                  <div className="py-2">
                    <div className="flex items-center mb-1 sm:mb-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-blue-600 font-bold text-sm">1</span>
                      </div>
                      <h3 className="text-base font-semibold text-slate-800">Get Your Token</h3>
                    </div>
                    <div className="pl-6 sm:pl-8 space-y-1.5 sm:space-y-2">
                      <p className="text-slate-700">Visit <a href="https://sync.rknain.com" className="text-blue-600 hover:underline">sync.rknain.com</a> to generate your unique authentication token. This token will be used to securely connect your devices.</p>
                      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r">
                        <p className="text-sm text-amber-800">Keep your token secure and don't share it with others. Anyone with this token can access your clipboard data.</p>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Download */}
                  <div className="py-2">
                    <div className="flex items-center mb-2 sm:mb-4">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-purple-600 font-bold">2</span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800">Download the Executable</h3>
                    </div>
                    <div className="pl-6 sm:pl-8 space-y-1.5 sm:space-y-2">
                      <p className="text-slate-700">Download the latest <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono">sync.exe</code> from the releases page:</p>
                      <div className="bg-slate-800 rounded-lg p-4 max-w-full overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-400 text-xs font-mono">Download URL</span>
                          <button 
                            onClick={() => handleCopy('https://github.com/yourusername/clipboard-sync/releases/latest')}
                            className="text-slate-400 hover:text-white transition-colors text-xs flex items-center whitespace-nowrap"
                          >
                            {copied ? (
                              <>
                                <Check className="w-3 h-3 mr-1 text-green-400 flex-shrink-0" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="w-full overflow-x-auto">
                          <pre className="text-green-400 font-mono text-sm py-1 pr-2">
                            <code className="whitespace-nowrap">https://github.com/ravi-ivar-7/clipboard-sync/releases/latest</code>
                          </pre>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600">Download the <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono">sync.exe</code> file to a permanent location on your computer (e.g., <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono">C:\\ClipboardSync</code>).</p>
                    </div>
                  </div>

                  {/* Step 3: Run Command */}
                  <div className="py-2">
                    <div className="flex items-center mb-2 sm:mb-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-emerald-600 font-bold">3</span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800">Run the Client</h3>
                    </div>
                    <div className="pl-6 sm:pl-8 space-y-1.5 sm:space-y-2">
                      <p className="text-slate-700">Open Command Prompt and navigate to the directory where you downloaded <code className="bg-slate-100 px-1 py-0.5 rounded text-sm font-mono">sync.exe</code>, then run:</p>
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-200 mb-2 text-xs">
                        <p className="font-mono text-slate-600"># Example (replace path):</p>
                        <p className="font-mono text-slate-700">cd C:\ClipboardSync</p>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-4 max-w-full overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-400 text-xs font-mono">Command Prompt</span>
                          <button 
                            onClick={() => handleCopy('./sync.exe -h sync.rknain.com -t YOUR_TOKEN -i 10000 -q')}
                            className="text-slate-400 hover:text-white transition-colors text-xs flex items-center whitespace-nowrap"
                          >
                            {copied ? (
                              <>
                                <Check className="w-3 h-3 mr-1 text-green-400 flex-shrink-0" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="w-full overflow-x-auto">
                          <pre className="text-green-400 font-mono text-sm py-1 pr-2">
                            <code className="whitespace-nowrap">./sync.exe -h sync.rknain.com -t YOUR_TOKEN -i 10000 -q</code>
                          </pre>
                        </div>
                      </div>
                      <div className="text-sm text-slate-600 space-y-1.5">
                        <p>Replace <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono">YOUR_TOKEN</code> with your token from step 1.</p>
                        <p className="font-medium">Flags:</p>
                        <ul className="space-y-1">
                          <li className="flex items-baseline gap-1">
                            <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono">-h sync.rknain.com</code>
                            <span className="text-xs">- Sync server</span>
                          </li>
                          <li className="flex items-baseline gap-1">
                            <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono">-t TOKEN</code>
                            <span className="text-xs">- Auth token</span>
                          </li>
                          <li className="flex items-baseline gap-1">
                            <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono">-i 10000</code>
                            <span className="text-xs">- Update interval (ms)</span>
                          </li>
                          <li className="flex items-baseline gap-1">
                            <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono">-q</code>
                            <span className="text-xs">- Quiet mode</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Run as Service */}
                  <div className="py-2">
                    <div className="flex items-center mb-2 sm:mb-4">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-amber-600 font-bold">4</span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800">Set Up as Background Service</h3>
                    </div>
                    <div className="pl-6 sm:pl-8 space-y-1.5 sm:space-y-2">
                      <p className="text-slate-700">To run Clipboard Sync automatically in the background, create a VBS script:</p>
                      
                      <div className="space-y-2">
                        <div>
                          <h4 className="font-medium text-slate-800 mb-1 sm:mb-2">1. Create a VBS Script</h4>
                          <p className="text-sm text-slate-600 mb-1 sm:mb-2">Create a new text file named <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">clipboard-sync.vbs</code> with the following content:</p>
                          <div className="bg-slate-800/95 rounded-md p-1.5 overflow-hidden">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-slate-400 text-[11px] font-mono">clipboard-sync.vbs</span>
                              <button 
                                onClick={() => handleCopy('Set WshShell = CreateObject(\"WScript.Shell\")\nWshShell.Run \"""" & CreateObject(\"WScript.ScriptFullName\").ParentFolder.Path & "\\\\sync.exe\" & \"\"" -h sync.rknain.com -t YOUR_TOKEN -i 10000 -q\", 0, False')}
                                className="text-slate-400 hover:text-white transition-colors text-[11px] flex items-center whitespace-nowrap px-2 py-0.5 bg-slate-700/50 rounded"
                              >
                                {copied ? (
                                  <>
                                    <Check className="w-2.5 h-2.5 mr-1 text-green-400 flex-shrink-0" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-2.5 h-2.5 mr-1 flex-shrink-0" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="w-full overflow-x-auto">
                              <pre className="text-green-400 font-mono text-sm py-1 pr-2">
                                <code className="whitespace-nowrap">
                                  Set WshShell = CreateObject("WScript.Shell")
                                  <br />
                                  WshShell.Run <span className="text-amber-300">"""" & CreateObject("WScript.ScriptFullName").ParentFolder.Path & "\\sync.exe" & """"</span> & _
                                  <br />
                                  &nbsp;&nbsp;" -h sync.rknain.com -t YOUR_TOKEN -i 10000 -q", 0, False
                                </code>
                              </pre>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 mt-2">
                            <span className="font-medium text-amber-400">Important:</span> Replace <code className="bg-slate-700/50 px-1 py-0.5 rounded text-[11px] font-mono text-amber-300">YOUR_TOKEN</code> with your token
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium text-slate-800 mb-1 sm:mb-2">2. Place Files in the Same Directory</h4>
                          <p className="text-sm text-slate-600">Place the VBS script in the same directory as <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">sync.exe</code>.</p>
                        </div>

                        <div>
                          <h4 className="font-medium text-slate-800 mb-1 sm:mb-2">3. Create a Shortcut to Run on Startup</h4>
                          <p className="text-sm text-slate-600 mb-1 sm:mb-2">Create a shortcut to the VBS script and place it in your Windows startup folder:</p>
                          <div className="bg-slate-50/90 rounded-lg p-2 border border-slate-100">
                            <code className="text-sm font-mono text-slate-700">%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup</code>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">The script will now run automatically when you log in to Windows.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h2 className="text-xl font-semibold text-slate-800 mb-6">Troubleshooting & FAQs</h2>
                <div className="space-y-2 sm:space-y-4">
                  {faqs.map((faq, index) => (
                    <div 
                      key={index} 
                      className={`rounded-xl p-5 border border-slate-100 shadow-sm ${
                        index % 2 === 0 ? 'bg-white/90' : 'bg-slate-50/90'
                      } hover:bg-opacity-100 transition-all duration-200`}
                    >
                      <h3 className="font-medium text-slate-800 flex items-start">
                        <BadgeQuestionMark className={`w-4 h-4 mr-2 mt-0.5 flex-shrink-0 ${
                          index % 2 === 0 ? 'text-purple-500' : 'text-slate-500'
                        }`} />
                        {faq.question}
                      </h3>
                      <p className="mt-2 text-slate-600 text-sm pl-6">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 max-w-4xl mx-auto px-4">
          <Link 
            href="/blogs/what-is-clipboard-sync" 
            className="group w-full sm:w-auto text-center sm:text-left inline-flex items-center justify-center sm:justify-start text-indigo-600 hover:text-indigo-800 font-medium transition-all duration-200 py-2.5 px-5 rounded-lg hover:bg-indigo-50 border border-indigo-100 hover:border-indigo-200"
          >
            <svg className="w-4 h-4 mr-2 transform rotate-180 flex-shrink-0 text-indigo-500 group-hover:text-indigo-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>What is Clipboard Sync?</span>
          </Link>
          <Link 
            href="/blogs/use-cases" 
            className="group w-full sm:w-auto text-center sm:text-left inline-flex items-center justify-center sm:justify-end text-blue-600 hover:text-blue-800 font-medium transition-all duration-200 py-2.5 px-5 rounded-lg hover:bg-blue-50 border border-blue-100 hover:border-blue-200"
          >
            <span>Use Cases</span>
            <svg className="w-4 h-4 ml-2 flex-shrink-0 text-blue-500 group-hover:text-blue-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
