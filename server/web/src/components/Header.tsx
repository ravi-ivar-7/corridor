'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, ChevronDown, Menu, X, Info, List, Download, Monitor, Smartphone, Terminal } from 'lucide-react';
import Image from 'next/image';
export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isDownloadsOpen, setIsDownloadsOpen] = useState(false);
  const pathname = usePathname();
  const resourcesDropdownRef = useRef<HTMLDivElement>(null);
  const downloadsDropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleResources = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResourcesOpen(!isResourcesOpen);
  };

  const toggleDownloads = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDownloadsOpen(!isDownloadsOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resourcesDropdownRef.current && !resourcesDropdownRef.current.contains(event.target as Node)) {
        setIsResourcesOpen(false);
      }
      if (downloadsDropdownRef.current && !downloadsDropdownRef.current.contains(event.target as Node)) {
        setIsDownloadsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-200">
                <Image 
                  src="/window.svg" 
                  alt="Corridor" 
                  width={16}
                  height={16}
                  className="h-4 w-4 text-blue-600" 
                />
              </div>
              <span className="text-base font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                Corridor
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-3">
            <Link 
              href="/" 
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                pathname === '/' 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Home className={`h-4 w-4 ${pathname === '/' ? 'text-blue-500' : 'text-blue-400 group-hover:text-blue-500'}`} />
                Home
              </span>
            </Link>

            <div className="relative" ref={resourcesDropdownRef}>
              <button
                onClick={toggleResources}
                onMouseEnter={() => setIsResourcesOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isResourcesOpen || pathname.startsWith('/resources')
                    ? 'text-blue-600 bg-white/30 border-blue-200 shadow-lg shadow-blue-500/20'
                    : 'text-slate-700/80 hover:text-slate-900 hover:bg-white/30 border-white/20 hover:border-white/40 hover:shadow-lg hover:shadow-blue-500/20'
                }`}
              >
                <BookOpen className={`h-4 w-4 ${isResourcesOpen || pathname.startsWith('/resources') ? 'text-blue-500' : 'text-slate-500'}`} />
                Resources
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isResourcesOpen ? 'rotate-180' : ''}`} />
              </button>

              {isResourcesOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-xl border border-white/40 shadow-2xl shadow-black/20 overflow-hidden z-50"
                  onMouseEnter={() => setIsResourcesOpen(true)}
                  onMouseLeave={() => setIsResourcesOpen(false)}
                >
                  <Link
                    href="/resources"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-white/70 transition-all duration-200"
                  >
                    <BookOpen className="w-4 h-4 text-purple-500" />
                    All Resources
                  </Link>
                  <Link
                    href="/resources/what-is-corridor"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-white/70 transition-all duration-200"
                  >
                    <span className="w-4 h-4 text-blue-500">❓</span>
                    What is Corridor?
                  </Link>
                  <Link
                    href="/resources/how-to-use"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-white/70 transition-all duration-200"
                  >
                    <span className="w-4 h-4 text-emerald-500">🛠️</span>
                    How to Use
                  </Link>
                  <Link
                    href="/resources/use-cases"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-white/70 transition-all duration-200"
                  >
                    <span className="w-4 h-4 text-purple-500">💡</span>
                    Use Cases
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/about"
              className={`flex items-center px-4 py-2 text-sm text-slate-600 hover:bg-slate-50/80 rounded-lg transition-colors ${
                pathname === '/about'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <Info className="h-4 w-4 text-slate-500" />
                About
              </span>
            </Link>

            <div className="relative" ref={downloadsDropdownRef}>
              <button
                onClick={toggleDownloads}
                onMouseEnter={() => setIsDownloadsOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isDownloadsOpen || pathname.startsWith('/downloads')
                    ? 'text-blue-600 bg-white/30 border-blue-200 shadow-lg shadow-blue-500/20'
                    : 'text-slate-700/80 hover:text-slate-900 hover:bg-white/30 border-white/20 hover:border-white/40 hover:shadow-lg hover:shadow-blue-500/20'
                }`}
              >
                <Download className={`h-4 w-4 ${isDownloadsOpen || pathname.startsWith('/downloads') ? 'text-blue-500' : 'text-slate-500'}`} />
                Downloads
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDownloadsOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDownloadsOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-xl border border-white/40 shadow-2xl shadow-black/20 overflow-hidden z-50"
                  onMouseEnter={() => setIsDownloadsOpen(true)}
                  onMouseLeave={() => setIsDownloadsOpen(false)}
                >
                  <Link
                    href="/downloads"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-white/70 transition-all duration-200"
                  >
                    <Download className="w-4 h-4 text-blue-500" />
                    All Downloads
                  </Link>
                  <Link
                    href="/downloads/windows"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-white/70 transition-all duration-200"
                  >
                    <Monitor className="w-4 h-4 text-sky-500" />
                    Windows
                  </Link>
                  <Link
                    href="/downloads/linux"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-white/70 transition-all duration-200"
                  >
                    <Terminal className="w-4 h-4 text-orange-500" />
                    Linux
                  </Link>
                  <Link
                    href="/downloads/android"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-white/70 transition-all duration-200"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-500" />
                    Android
                  </Link>
                </div>
              )}
            </div>
            </nav>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2.5 rounded-xl bg-white/30 border border-slate-200 text-slate-600 hover:bg-white/50 hover:text-slate-900 transition-all duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            </div>
          </div>
        </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-inner z-50">
          <div className="space-y-1 p-2">
            <Link
              href="/"
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                pathname === '/' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-slate-700 hover:bg-slate-50/80'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <Home className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
              <span>Home</span>
            </Link>
            
            <div className="space-y-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsResourcesOpen(!isResourcesOpen);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg ${
                  pathname.startsWith('/resources')
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-700 hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-3 text-purple-500" />
                  <span>Resources</span>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${isResourcesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <div className={`overflow-hidden transition-all duration-200 ${isResourcesOpen ? 'max-h-40' : 'max-h-0'}`}>
                <div className="pl-4 space-y-1 py-1">
                  <Link
                    href="/resources"
                    className="flex items-center px-4 py-2 text-sm rounded-lg text-slate-700 hover:bg-slate-50/80"
                    onClick={() => {
                      setIsOpen(false);
                      setIsResourcesOpen(false);
                    }}
                  >
                    <List className="h-4 w-4 mr-3 text-slate-400" />
                    All Resources
                  </Link>
                  <Link
                    href="/resources/what-is-corridor"
                    className="flex items-center px-4 py-2 text-sm rounded-lg text-slate-700 hover:bg-slate-50/80"
                    onClick={() => {
                      setIsOpen(false);
                      setIsResourcesOpen(false);
                    }}
                  >
                    <span className="w-4 h-4 mr-3 text-blue-500">❓</span>
                    What is Corridor?
                  </Link>
                  <Link
                    href="/resources/how-to-use"
                    className="flex items-center px-4 py-2 text-sm rounded-lg text-slate-700 hover:bg-slate-50/80"
                    onClick={() => {
                      setIsOpen(false);
                      setIsResourcesOpen(false);
                    }}
                  >
                    <span className="w-4 h-4 mr-3 text-emerald-500">🛠️</span>
                    How to Use
                  </Link>
                  <Link
                    href="/resources/use-cases"
                    className="flex items-center px-4 py-2 text-sm rounded-lg text-slate-700 hover:bg-slate-50/80"
                    onClick={() => {
                      setIsOpen(false);
                      setIsResourcesOpen(false);
                    }}
                  >
                    <span className="w-4 h-4 mr-3 text-purple-500">💡</span>
                    Use Cases
                  </Link>
                </div>
              </div>
            </div>
            
            <Link
              href="/about"
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                pathname === '/about'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-slate-700 hover:bg-slate-50/80'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <Info className="h-5 w-5 mr-3 text-emerald-500 flex-shrink-0" />
              <span>About</span>
            </Link>

            <div className="space-y-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsDownloadsOpen(!isDownloadsOpen);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg ${
                  pathname.startsWith('/downloads')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-700 hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-center">
                  <Download className="h-5 w-5 mr-3 text-blue-500" />
                  <span>Downloads</span>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${isDownloadsOpen ? 'rotate-180' : ''}`} />
              </button>

              <div className={`overflow-hidden transition-all duration-200 ${isDownloadsOpen ? 'max-h-60' : 'max-h-0'}`}>
                <div className="pl-4 space-y-1 py-1">
                  <Link
                    href="/downloads"
                    className="flex items-center px-4 py-2 text-sm rounded-lg text-slate-700 hover:bg-slate-50/80"
                    onClick={() => {
                      setIsOpen(false);
                      setIsDownloadsOpen(false);
                    }}
                  >
                    <Download className="h-4 w-4 mr-3 text-slate-400" />
                    All Downloads
                  </Link>
                  <Link
                    href="/downloads/windows"
                    className="flex items-center px-4 py-2 text-sm rounded-lg text-slate-700 hover:bg-slate-50/80"
                    onClick={() => {
                      setIsOpen(false);
                      setIsDownloadsOpen(false);
                    }}
                  >
                    <Monitor className="h-4 w-4 mr-3 text-sky-500" />
                    Windows
                  </Link>
                  <Link
                    href="/downloads/linux"
                    className="flex items-center px-4 py-2 text-sm rounded-lg text-slate-700 hover:bg-slate-50/80"
                    onClick={() => {
                      setIsOpen(false);
                      setIsDownloadsOpen(false);
                    }}
                  >
                    <Terminal className="h-4 w-4 mr-3 text-orange-500" />
                    Linux
                  </Link>
                  <Link
                    href="/downloads/android"
                    className="flex items-center px-4 py-2 text-sm rounded-lg text-slate-700 hover:bg-slate-50/80"
                    onClick={() => {
                      setIsOpen(false);
                      setIsDownloadsOpen(false);
                    }}
                  >
                    <Smartphone className="h-4 w-4 mr-3 text-emerald-500" />
                    Android
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </header>
      {/* Add minimal padding to prevent content from being hidden under the header */}
      <div className="pt-16"></div>
    </>
  );
}
