'use client'

import { useState } from 'react';
import { Clipboard, Zap, Smartphone, ArrowRight, Search, Clock } from 'lucide-react';
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
          <span className={`px-2 py-1 text-[11px] sm:text-xs font-medium rounded-full ${post.gradient} bg-opacity-10 text-emerald-700`}>
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
          <div className="inline-flex items-center text-xs sm:text-sm font-medium text-emerald-600 group-hover:text-emerald-700 transition-colors">
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
      description: 'Learn about Corridor and how it can help you share text across your devices.',
      slug: 'what-is-clipboard-sync',
      category: 'Guide',
      readTime: '3 min read',
      publishDate: 'October 26, 2025',
      icon: Clipboard,
      gradient: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      bgGradient: 'bg-gradient-to-r from-emerald-50 to-teal-50',
    },
    {
      title: 'How to Use Corridor',
      description: 'Step-by-step guide on setting up and using Corridor.',
      slug: 'how-to-use',
      category: 'Tutorial',
      readTime: '4 min read',
      publishDate: 'October 25, 2025',
      icon: Zap,
      gradient: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      bgGradient: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    },
    {
      title: 'Use Cases for Corridor',
      description: 'Discover practical ways to use Corridor in your daily workflow and boost productivity.',
      slug: 'use-cases',
      category: 'Tips',
      readTime: '5 min read',
      publishDate: 'October 24, 2025',
      icon: Smartphone,
      gradient: 'bg-gradient-to-r from-purple-500 to-pink-500',
      bgGradient: 'bg-gradient-to-r from-purple-50 to-pink-50',
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
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Tips, tricks, and guides to help you get the most out of Corridor
          </p>
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
