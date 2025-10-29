import Link from 'next/link';
import { Info, Wrench } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <nav className="flex flex-row justify-center items-center flex-wrap gap-6 mb-4">
            <Link 
              href="/blogs/what-is-clipboard-sync" 
              className="flex items-center text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors group whitespace-nowrap"
            >
              <div className="p-1.5 mr-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                <Info className="h-4 w-4 text-indigo-600" />
              </div>
              What is it?
            </Link>
            <Link 
              href="/blogs/how-to-use" 
              className="flex items-center text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors group whitespace-nowrap"
            >
              <div className="p-1.5 mr-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                <Wrench className="h-4 w-4 text-indigo-600" />
              </div>
              How to Use
            </Link>
          </nav>
          <div className="text-center">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Corridor. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
