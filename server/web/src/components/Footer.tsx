import Link from 'next/link';
import { Info, Wrench, Download, BookOpen, Monitor, Terminal, Smartphone, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-gradient-to-b from-white to-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 sm:py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
            {/* Resources Column */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 sm:mb-4">Resources</h3>
              <div className="space-y-2 sm:space-y-3">
                <Link
                  href="/resources/what-is-corridor"
                  className="flex items-center text-sm text-slate-600 hover:text-amber-600 transition-colors group"
                >
                  <div className="p-1 mr-2 bg-amber-50 rounded group-hover:bg-amber-100 transition-colors flex-shrink-0">
                    <Info className="h-3.5 w-3.5 text-amber-600" />
                  </div>
                  <span className="break-words">What is Corridor?</span>
                </Link>
                <Link
                  href="/resources/how-to-use"
                  className="flex items-center text-sm text-slate-600 hover:text-cyan-600 transition-colors group"
                >
                  <div className="p-1 mr-2 bg-cyan-50 rounded group-hover:bg-cyan-100 transition-colors flex-shrink-0">
                    <Wrench className="h-3.5 w-3.5 text-cyan-600" />
                  </div>
                  <span>How to Use</span>
                </Link>
                <Link
                  href="/resources/use-cases"
                  className="flex items-center text-sm text-slate-600 hover:text-fuchsia-600 transition-colors group"
                >
                  <div className="p-1 mr-2 bg-fuchsia-50 rounded group-hover:bg-fuchsia-100 transition-colors flex-shrink-0">
                    <BookOpen className="h-3.5 w-3.5 text-fuchsia-600" />
                  </div>
                  <span>Use Cases</span>
                </Link>
              </div>
            </div>

            {/* Downloads Column */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 sm:mb-4">Downloads</h3>
              <div className="space-y-2 sm:space-y-3">
                <Link
                  href="/downloads/windows"
                  className="flex items-center text-sm text-slate-600 hover:text-sky-600 transition-colors group"
                >
                  <div className="p-1 mr-2 bg-sky-50 rounded group-hover:bg-sky-100 transition-colors flex-shrink-0">
                    <Monitor className="h-3.5 w-3.5 text-sky-600" />
                  </div>
                  <span>Windows</span>
                </Link>
                <Link
                  href="/downloads/linux"
                  className="flex items-center text-sm text-slate-600 hover:text-orange-600 transition-colors group"
                >
                  <div className="p-1 mr-2 bg-orange-50 rounded group-hover:bg-orange-100 transition-colors flex-shrink-0">
                    <Terminal className="h-3.5 w-3.5 text-orange-600" />
                  </div>
                  <span>Linux</span>
                </Link>
                <Link
                  href="/downloads/android"
                  className="flex items-center text-sm text-slate-600 hover:text-emerald-600 transition-colors group"
                >
                  <div className="p-1 mr-2 bg-emerald-50 rounded group-hover:bg-emerald-100 transition-colors flex-shrink-0">
                    <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <span>Android</span>
                </Link>
              </div>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 sm:mb-4">Company</h3>
              <div className="space-y-2 sm:space-y-3">
                <Link
                  href="/about"
                  className="flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <span>About</span>
                </Link>
                <Link
                  href="/privacy"
                  className="flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <span>Privacy Policy</span>
                </Link>
                <Link
                  href="/terms"
                  className="flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <span>Terms of Service</span>
                </Link>
              </div>
            </div>

            {/* About Column */}
            <div className="col-span-2 lg:col-span-1">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 sm:mb-4">Corridor</h3>
              <p className="text-sm text-slate-600 mb-3 sm:mb-4">
                Seamless clipboard synchronization across all your devices.
              </p>
              <div className="flex gap-1.5 sm:gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-sky-50 to-sky-100 rounded-lg flex items-center justify-center">
                  <Monitor className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-600" />
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg flex items-center justify-center">
                  <Terminal className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600" />
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg flex items-center justify-center">
                  <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-violet-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500 mb-3">
              &copy; {new Date().getFullYear()} Corridor. All rights reserved.
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <Link href="/privacy" className="text-slate-500 hover:text-slate-700 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-slate-500 hover:text-slate-700 transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
