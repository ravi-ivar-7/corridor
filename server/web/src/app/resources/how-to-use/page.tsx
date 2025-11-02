'use client';

import React, { useState } from 'react';
import { Copy, Download, Terminal, Check, Key, Server, Cpu, HelpCircle, Globe, Monitor, Smartphone } from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    title: 'Get Your Token',
    description: 'Visit the Corridor web app to generate your unique authentication token.',
    icon: <Key className="w-5 h-5" />,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Choose Platform',
    description: 'Windows, Linux, Android app or web browser.',
    icon: <Download className="w-5 h-5" />,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    title: 'Enter Your Token',
    description: 'Open Corridor and enter your token to connect to the sync room.',
    icon: <Terminal className="w-5 h-5" />,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
  },
  {
    title: 'Start Syncing',
    description: 'Copy text on one device and paste it on any other device instantly!',
    icon: <Server className="w-5 h-5" />,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
  },
];


const faqs = [
  {
    question: 'How do I get my token?',
    answer: 'Visit the Corridor web app to generate your unique authentication token. This token is required to sync your clipboard across devices.'
  },
  {
    question: 'Is my clipboard data secure?',
    answer: 'Yes, all clipboard data is encrypted in transit. Only devices with your unique token can access your clipboard data.'
  },
  {
    question: 'Which platforms are supported?',
    answer: 'Corridor works on Windows, Linux, Android, and any web browser. Download native apps for better integration or use the web version instantly.'
  },
  {
    question: 'How do I run it in the background?',
    answer: 'On Windows/Linux, enable auto-start in the setup dialog. The app runs in the system tray. On Android, the app runs as a background service.'
  },
  {
    question: 'Can I use this on multiple devices?',
    answer: 'Yes! Use the same token on all your devices (Windows, Linux, Android, or web) to sync clipboard content across all of them in real-time.'
  },
  {
    question: 'What happens when I\'m offline?',
    answer: 'Items copied while offline are queued and automatically synced when you reconnect. No clipboard data is lost.'
  }
];

export default function HowToUsePage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}


        {/* Quick Start Steps */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6 text-center">Quick Start</h2>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {steps.map((step, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="p-4 sm:p-5">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 ${step.bgColor} rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:rotate-6 transition-transform duration-300`}>
                    <div className={step.color}>
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1.5 sm:mb-2">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Instructions */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6 text-center">Detailed Instructions</h2>
          
          {/* Step 1: Get Token */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-100 shadow-sm mb-6">
            <div className="p-2 md:p-4">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Get Your Token</h3>
              </div>
              <div className="pl-6 sm:pl-8 space-y-3">
                <p className="text-slate-700">Visit the <Link href="/" className="text-blue-600 hover:underline">Corridor web app</Link> to generate your unique authentication token. This token will be used to securely connect your devices.</p>
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r">
                  <p className="text-sm text-amber-800">Keep your token secure and don&apos;t share it with others. Anyone with this token can access your clipboard data.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Choose Platform */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-100 shadow-sm mb-6">
            <div className="p-2 md:p-4">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-purple-600 font-bold">2</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Choose Your Platform</h3>
              </div>
              <div className="pl-6 sm:pl-8 space-y-3">
                <p className="text-slate-700">Corridor is available on multiple platforms:</p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-sky-50 p-4 rounded border border-sky-200">
                    <h4 className="font-semibold text-slate-800 mb-2 flex items-center">
                      <Monitor className="w-4 h-4 mr-2 text-sky-600" />
                      Windows
                    </h4>
                    <p className="text-sm text-slate-600 mb-3">Native application with system tray integration and auto-start.</p>
                    <Link
                      href="/downloads/windows"
                      className="inline-flex items-center px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Link>
                  </div>

                  <div className="bg-orange-50 p-4 rounded border border-orange-200">
                    <h4 className="font-semibold text-slate-800 mb-2 flex items-center">
                      <Monitor className="w-4 h-4 mr-2 text-orange-600" />
                      Linux
                    </h4>
                    <p className="text-sm text-slate-600 mb-3">Native app for Ubuntu, Debian, Fedora, and other distros.</p>
                    <Link
                      href="/downloads/linux"
                      className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Link>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded border border-emerald-200">
                    <h4 className="font-semibold text-slate-800 mb-2 flex items-center">
                      <Smartphone className="w-4 h-4 mr-2 text-emerald-600" />
                      Android
                    </h4>
                    <p className="text-sm text-slate-600 mb-3">Mobile app for Android phones and tablets.</p>
                    <Link
                      href="/downloads/android"
                      className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Link>
                  </div>

                  <div className="bg-violet-50 p-4 rounded border border-violet-200">
                    <h4 className="font-semibold text-slate-800 mb-2 flex items-center">
                      <Globe className="w-4 h-4 mr-2 text-violet-600" />
                      Web
                    </h4>
                    <p className="text-sm text-slate-600 mb-3">Use directly in any web browser - no installation needed.</p>
                    <Link
                      href="/"
                      className="inline-flex items-center px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Open Web App
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Enter Token */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-100 shadow-sm mb-6">
            <div className="p-2 md:p-4">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-emerald-600 font-bold">3</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Enter Your Token</h3>
              </div>
              <div className="pl-6 sm:pl-8 space-y-3">
                <p className="text-slate-700">Open Corridor and enter your token:</p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-2">Windows:</h4>
                    <ol className="text-sm text-slate-700 space-y-1 list-decimal list-inside">
                      <li>Run the app - setup dialog appears</li>
                      <li>Enter your token</li>
                      <li>Choose mode (interactive/silent)</li>
                      <li>Click &quot;Save and Start&quot;</li>
                    </ol>
                  </div>

                  <div className="bg-slate-50 p-4 rounded border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-2">Linux:</h4>
                    <ol className="text-sm text-slate-700 space-y-1 list-decimal list-inside">
                      <li>Run the <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono"> Corridor</code>application</li>
                      <li>Setup dialog appears on first run</li>
                      <li>Enter token and configure settings</li>
                      <li>System tray icon shows connection</li>
                    </ol>
                  </div>

                  <div className="bg-slate-50 p-4 rounded border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-2">Android:</h4>
                    <ol className="text-sm text-slate-700 space-y-1 list-decimal list-inside">
                      <li>Open the Corridor app</li>
                      <li>Enter your token and other settings</li>
                      <li>Grant notifications permissions</li>
                      <li>Start syncing automatically</li>
                    </ol>
                  </div>

                  <div className="bg-slate-50 p-4 rounded border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-2">Web:</h4>
                    <ol className="text-sm text-slate-700 space-y-1 list-decimal list-inside">
                      <li>Visit the web app</li>
                      <li>Enter or generate a token</li>
                      <li>Start copying and pasting</li>
                      <li>Text syncs instantly</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Start Syncing */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-100 shadow-sm">
            <div className="p-2 md:p-4">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-amber-600 font-bold">4</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Start Syncing</h3>
              </div>
              <div className="pl-6 sm:pl-8 space-y-3">
                <p className="text-slate-700">That&apos;s it! Now you can copy text on one device and paste it on any other device with the same token.</p>
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r">
                  <p className="text-sm text-green-800">Corridor works in real-time - changes appear instantly across all connected devices!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-100 shadow-sm">
                <div className="p-4 sm:p-6">
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center">
                    <HelpCircle className="w-4 h-4 mr-2 text-blue-500" />
                    {faq.question}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 max-w-4xl mx-auto px-4">
          <Link
            href="/resources/what-is-corridor"
            className="group w-full sm:w-auto text-center sm:text-left inline-flex items-center justify-center sm:justify-start text-indigo-600 hover:text-indigo-800 font-medium transition-all duration-200 py-2.5 px-5 rounded-lg hover:bg-indigo-50 border border-indigo-100 hover:border-indigo-200"
          >
            <svg className="w-4 h-4 mr-2 transform rotate-180 flex-shrink-0 text-indigo-500 group-hover:text-indigo-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>What is Corridor?</span>
          </Link>
          <Link 
            href="/resources/use-cases" 
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