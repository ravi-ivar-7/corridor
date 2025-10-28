'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Clipboard, 
  Smartphone, 
  Monitor, 
  Code, 
  Share2, 
  Terminal, 
  BookOpen, 
  LucideIcon, 
  Key, 
  Palette, 
  AlertTriangle, 
  Languages, 
  Users, 
  Code2, 
  ClipboardCheck,
} from 'lucide-react';

type UseCase = {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
};

export default function UseCasesPage() {
  const useCases: UseCase[] = [
  {
    title: 'Real-Time Exam Collaboration',
    description: 'Exchange answers and solutions instantly with peers during exams or practice sessions — securely and in real time.',
    icon: BookOpen,
    color: 'text-purple-500'
  },
    {
      title: 'Study Group Collaboration',
      description: 'Share key concepts, notes, and problem solutions instantly with your study group members during collaborative learning sessions.',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      title: 'Assignment Help',
      description: 'Collaborate on problem sets and assignments while maintaining academic integrity through transparent sharing.',
      icon: ClipboardCheck,
      color: 'text-amber-500'
    },
    {
      title: 'Programming Labs',
      description: 'Share terminal commands, debug output, and code snippets instantly during hands-on coding sessions.',
      icon: Terminal,
      color: 'text-indigo-500'
    },
    
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Use Cases for Clipboard Sync</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Discover how Clipboard Sync can streamline your workflow across devices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {useCases.map((useCase, index) => (
            <div 
              key={index} 
              className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-100 p-6 hover:shadow-sm transition-shadow"
            >
              <div className={`w-12 h-12 rounded-lg ${useCase.color.replace('text', 'bg')} bg-opacity-10 flex items-center justify-center mb-4`}>
                <useCase.icon className={`w-6 h-6 ${useCase.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">{useCase.title}</h3>
              <p className="text-slate-600">{useCase.description}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8 max-w-4xl mx-auto px-4">
          <Link 
            href="/blogs/how-to-use" 
            className="group w-full sm:w-auto text-center inline-flex items-center justify-center text-indigo-600 hover:text-indigo-800 font-medium transition-all duration-200 py-2.5 px-5 rounded-lg hover:bg-indigo-50 border border-indigo-100 hover:border-indigo-200"
          >
            <span>Learn How to Get Started</span>
            <svg className="w-4 h-4 ml-2 flex-shrink-0 text-indigo-500 group-hover:text-indigo-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
