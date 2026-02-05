
import React from 'react';
import { Clock, User, ArrowRight, Tag } from 'lucide-react';
import { Post } from '../types';

interface BlogCardProps {
  post: Post;
  onClick: () => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, onClick }) => {
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Update': return 'bg-emerald-500 text-white border-emerald-700';
      case 'Tips': return 'bg-rose-500 text-white border-rose-700';
      case 'News': return 'bg-blue-500 text-white border-blue-700';
      case 'Community': return 'bg-yellow-400 text-slate-900 border-yellow-600';
      default: return 'bg-slate-700 text-white border-slate-900';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="group relative bg-[#242642] rounded-[2.5rem] border-4 border-[#2f3252] overflow-hidden shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-2 cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden">
        <img 
          src={post.image} 
          alt={post.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b2e]/80 to-transparent"></div>
        
        {/* Category Badge */}
        <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-full border-2 font-black text-xs uppercase tracking-wider ${getCategoryColor(post.category)}`}>
          {post.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
          <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {post.author.name}</span>
        </div>

        <h3 className="font-heading text-2xl text-white group-hover:text-purple-400 transition-colors leading-tight">
          {post.title}
        </h3>

        <p className="text-slate-400 text-sm line-clamp-2 font-medium leading-relaxed">
          {post.excerpt}
        </p>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-slate-500 text-xs font-bold">{post.date}</span>
          <div className="p-3 bg-slate-800 rounded-2xl group-hover:bg-purple-600 transition-colors">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
