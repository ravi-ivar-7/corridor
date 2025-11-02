'use client'

import { useState } from 'react';
import { Clipboard, Zap, Smartphone, ArrowRight, Search, Clock, Monitor, Terminal, Globe, Download } from 'lucide-react';
import Link from 'next/link';

type BlogPost = {
  title: string;
  description: string;
  slug: string;
  category: string;
  readTime: string;
  publishDate: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  bgGradient: string;
  textColor: string;
};
const BlogCard = ({ post }: { post: BlogPost }) => {
  const IconComponent = post.icon;
  
  return (
    <Link
      href={`/resources/${post.slug}`}
      className="group relative bg-white/80 backdrop-blur-sm rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full flex flex-col"
    >
      <div className={`absolute inset-0 ${post.bgGradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
      
      <div className="relative p-4 sm:p-5 flex-1 flex flex-col">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${post.gradient} rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:rotate-6 transition-transform duration-300`}>
          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <span className={`px-2 py-1 text-[11px] sm:text-xs font-medium rounded-full ${post.bgGradient} border border-slate-200/50 text-slate-700`}>
            {post.category}
          </span>
          <span className="flex items-center text-[11px] sm:text-xs text-slate-500">
            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
            {post.readTime}
          </span>
        </div>
        
        <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1.5 sm:mb-2 line-clamp-2">{post.title}</h3>
        <p className="text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4 line-clamp-3">{post.description}</p>
        
        <div className="mt-auto pt-2 border-t border-slate-100">
          <div className={`inline-flex items-center text-xs sm:text-sm font-medium ${post.textColor} transition-colors`}>
            Read more
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
};
export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const blogPosts: BlogPost[] = [
    {
      title: 'What is Corridor?',
      description: 'Learn about Corridor and how it works across Windows, Linux, Android, and Web platforms.',
      slug: 'what-is-corridor',
      category: 'Guide',
      readTime: '3 min read',
      publishDate: 'October 26, 2025',
      icon: Clipboard,
      gradient: 'bg-gradient-to-r from-amber-500 to-orange-500',
      bgGradient: 'bg-gradient-to-r from-amber-50 to-orange-50',
      textColor: 'text-amber-600 group-hover:text-amber-700',
    },
    {
      title: 'How to Use Corridor',
      description: 'Step-by-step guide on setting up Corridor on all your devices and getting started.',
      slug: 'how-to-use',
      category: 'Tutorial',
      readTime: '4 min read',
      publishDate: 'October 25, 2025',
      icon: Zap,
      gradient: 'bg-gradient-to-r from-cyan-500 to-blue-500',
      bgGradient: 'bg-gradient-to-r from-cyan-50 to-blue-50',
      textColor: 'text-cyan-600 group-hover:text-cyan-700',
    },
    {
      title: 'Use Cases for Corridor',
      description: 'Discover practical ways to use Corridor in your daily workflow and boost productivity.',
      slug: 'use-cases',
      category: 'Tips',
      readTime: '5 min read',
      publishDate: 'October 24, 2025',
      icon: Smartphone,
      gradient: 'bg-gradient-to-r from-fuchsia-500 to-pink-500',
      bgGradient: 'bg-gradient-to-r from-fuchsia-50 to-pink-50',
      textColor: 'text-fuchsia-600 group-hover:text-fuchsia-700',
    }
  ];

  const filteredPosts = blogPosts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    { name: 'All', count: blogPosts.length },
    { name: 'Tutorial', count: blogPosts.filter(p => p.category === 'Tutorial').length },
    { name: 'Guide', count: blogPosts.filter(p => p.category === 'Guide').length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 px-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-3 sm:mb-4">Corridor Resources</h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mb-6">
            Everything you need to get started with Corridor across all your devices
          </p>
        </div>

        {/* Platform Downloads Section */}
        <div className="mb-12 px-2">
          <div className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2 text-center">Available on All Platforms</h2>
            <p className="text-sm text-slate-600 text-center mb-6">Download native apps or use the web interface</p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Link
                href="/downloads/windows"
                className="group bg-gradient-to-br from-sky-50/80 to-sky-50/40 hover:from-sky-50 hover:to-sky-100/60 rounded-xl border border-sky-100/50 p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-sky-100/80 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Monitor className="w-6 h-6 sm:w-7 sm:h-7 text-sky-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1 text-sm sm:text-base">Windows</h3>
                  <p className="text-xs text-slate-600 mb-2">Native desktop app</p>
                  <div className="inline-flex items-center text-xs font-medium text-sky-600 group-hover:text-sky-700">
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </div>
                </div>
              </Link>

              <Link
                href="/downloads/linux"
                className="group bg-gradient-to-br from-orange-50/80 to-orange-50/40 hover:from-orange-50 hover:to-orange-100/60 rounded-xl border border-orange-100/50 p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-100/80 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Terminal className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1 text-sm sm:text-base">Linux</h3>
                  <p className="text-xs text-slate-600 mb-2">Lightweight binary</p>
                  <div className="inline-flex items-center text-xs font-medium text-orange-600 group-hover:text-orange-700">
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </div>
                </div>
              </Link>

              <Link
                href="/downloads/android"
                className="group bg-gradient-to-br from-emerald-50/80 to-emerald-50/40 hover:from-emerald-50 hover:to-emerald-100/60 rounded-xl border border-emerald-100/50 p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-100/80 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Smartphone className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1 text-sm sm:text-base">Android</h3>
                  <p className="text-xs text-slate-600 mb-2">Mobile app (APK)</p>
                  <div className="inline-flex items-center text-xs font-medium text-emerald-600 group-hover:text-emerald-700">
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </div>
                </div>
              </Link>

              <Link
                href="/"
                className="group bg-gradient-to-br from-violet-50/80 to-violet-50/40 hover:from-violet-50 hover:to-violet-100/60 rounded-xl border border-violet-100/50 p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-violet-100/80 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-violet-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1 text-sm sm:text-base">Web</h3>
                  <p className="text-xs text-slate-600 mb-2">Browser-based</p>
                  <div className="inline-flex items-center text-xs font-medium text-violet-600 group-hover:text-violet-700">
                    <ArrowRight className="w-3 h-3 mr-1" />
                    Open App
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="w-full max-w-2xl mx-auto mb-8 sm:mb-10 px-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm sm:text-base pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 sm:mb-10 px-2">
          {categories.map((category) => (
            <button
              key={category.name}
              className={`px-2.5 sm:px-3 py-1 text-xs sm:text-sm rounded-full border transition-colors whitespace-nowrap ${
                searchTerm === category.name || (searchTerm === '' && category.name === 'All')
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              onClick={() => setSearchTerm(category.name === 'All' ? '' : category.name)}
            >
              {category.name} <span className="font-medium">{category.count ? `(${category.count})` : ''}</span>
            </button>
          ))}
        </div>

        {/* Resources */}
        <div className="px-2">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4 sm:mb-6 flex items-center">
            <span className="w-1 h-5 sm:h-6 bg-slate-400 rounded-full mr-2"></span>
            All Articles
          </h2>
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredPosts.map((post, index) => (
                <BlogCard key={index} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white/50 rounded-xl border border-slate-200">
              <p className="text-slate-500">No articles found. Try a different search term.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
