
import React, { useEffect } from 'react';
import { ArrowLeft, Clock, Calendar, Share2, MessageSquare, ThumbsUp } from 'lucide-react';
import { Post } from '../types';

interface BlogPostProps {
  post: Post;
  onBack: () => void;
}

const BlogPost: React.FC<BlogPostProps> = ({ post, onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="animate-fade-in pb-20">
      {/* Article Header */}
      <div className="relative h-[400px] md:h-[600px] w-full">
        <img 
          src={post.image} 
          alt={post.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b2e] via-[#1a1b2e]/60 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <button 
              onClick={onBack}
              className="mb-8 flex items-center gap-2 px-6 py-2 bg-slate-900/80 backdrop-blur-md rounded-xl border-2 border-slate-700 text-white font-black hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" /> VOLTAR AO BLOG
            </button>
            
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                 <span className="px-4 py-1.5 bg-purple-600 rounded-full border-2 border-purple-800 font-black text-xs uppercase tracking-wider text-white shadow-lg">
                  {post.category}
                </span>
                <span className="flex items-center gap-1.5 text-slate-300 font-bold text-sm bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Calendar className="w-4 h-4 text-purple-400" /> {post.date}
                </span>
                <span className="flex items-center gap-1.5 text-slate-300 font-bold text-sm bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Clock className="w-4 h-4 text-blue-400" /> {post.readTime}
                </span>
              </div>
              
              <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl text-white leading-[0.9] drop-shadow-2xl">
                {post.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col gap-12">
          
          {/* Article Body */}
          <article className="space-y-8 w-full">
            <div className="bg-[#242642] rounded-[3rem] p-8 md:p-12 border-4 border-[#2f3252] shadow-2xl relative overflow-hidden">
              {/* Subtle accent light */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 blur-[80px] rounded-full"></div>
              
              <div className="prose prose-invert prose-purple max-w-none relative z-10">
                {post.content.split('\n').map((line, i) => {
                  if (line.startsWith('###')) {
                    return <h3 key={i} className="text-3xl font-heading text-white mt-12 mb-6 uppercase tracking-tight border-b-2 border-purple-500/20 pb-2">{line.replace('###', '')}</h3>;
                  }
                  if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.')) {
                     return (
                      <div key={i} className="flex items-start gap-4 mb-4 bg-slate-800/50 p-6 rounded-2xl border-l-4 border-rose-500 shadow-md">
                        <span className="text-rose-400 font-black text-2xl">{line.split('.')[0]}.</span>
                        <p className="text-slate-200 text-lg leading-relaxed">{line.split('.').slice(1).join('.').trim()}</p>
                      </div>
                    );
                  }
                  if (line.startsWith('-')) {
                    return (
                      <div key={i} className="flex items-start gap-4 mb-4">
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-500 mt-2.5 shrink-0 shadow-[0_0_8px_rgba(139,92,246,0.6)]"></div>
                        <p className="text-slate-300 text-lg font-medium leading-relaxed">{line.replace('-', '').trim()}</p>
                      </div>
                    );
                  }
                  return line.trim() ? (
                    <p key={i} className="text-slate-400 text-xl font-medium leading-relaxed mb-6">
                      {line}
                    </p>
                  ) : null;
                })}
              </div>

              {/* Interaction Bar */}
              <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 px-6 py-3 bg-purple-600/10 hover:bg-purple-600/20 border-2 border-purple-500/30 rounded-2xl text-purple-400 font-black transition-all hover:scale-105 active:scale-95">
                    <ThumbsUp className="w-5 h-5" /> 245
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 rounded-2xl text-slate-300 font-black transition-all hover:scale-105 active:scale-95">
                    <MessageSquare className="w-5 h-5" /> 18 Comentários
                  </button>
                </div>
                <button className="p-4 bg-slate-800 hover:bg-blue-600 rounded-2xl border-2 border-slate-700 transition-all text-white group shadow-lg">
                  <Share2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            {/* Author Card */}
            <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-[3rem] p-8 border-4 border-purple-500/20 flex flex-col md:flex-row items-center gap-8 shadow-xl">
              <img src={post.author.avatar} alt={post.author.name} className="w-32 h-32 rounded-[2rem] border-4 border-purple-500 shadow-xl object-cover" />
              <div className="text-center md:text-left flex-1">
                <p className="text-purple-400 font-black text-sm uppercase tracking-widest mb-1">SOBRE O AUTOR</p>
                <h4 className="text-3xl font-heading text-white mb-2">{post.author.name}</h4>
                <p className="text-slate-400 text-lg font-medium mb-4">{post.author.role}</p>
                <div className="flex justify-center md:justify-start gap-4">
                   <button className="text-slate-500 hover:text-white transition-colors font-bold text-sm uppercase tracking-wider">Ver Perfil</button>
                   <button className="text-slate-500 hover:text-white transition-colors font-bold text-sm uppercase tracking-wider">Mais Artigos</button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
