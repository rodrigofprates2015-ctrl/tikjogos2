import { Clock, User, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  date: string;
  category: 'News' | 'Tips' | 'Update' | 'Community';
  image: string;
  readTime: string;
  featured?: boolean;
}

interface BlogCardProps {
  post: BlogPost;
  onClick: () => void;
}

const getCategoryColor = (cat: string) => {
  switch (cat) {
    case 'Update': return 'bg-emerald-500 text-white border-emerald-700';
    case 'Tips': return 'bg-rose-500 text-white border-rose-700';
    case 'News': return 'bg-blue-500 text-white border-blue-700';
    case 'Community': return 'bg-yellow-400 text-slate-900 border-yellow-600';
    default: return 'bg-slate-700 text-white border-slate-900';
  }
};

export default function BlogCard({ post, onClick }: BlogCardProps) {
  const { t } = useLanguage();
  
  const postTitle = t(`blogPosts.post${post.id}.title`, post.title);
  const postExcerpt = t(`blogPosts.post${post.id}.excerpt`, post.excerpt);
  const postDate = t(`blogPosts.post${post.id}.date`, post.date);
  const postAuthorName = t(`blogPosts.post${post.id}.author`, post.author.name);
  const postCategory = t(`blogPosts.post${post.id}.category`, post.category);

  return (
    <div 
      onClick={onClick}
      className="group relative bg-[#242642] rounded-[2.5rem] border-4 border-[#2f3252] overflow-hidden shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-2 cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden">
        <img 
          src={post.image} 
          alt={postTitle} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b2e]/80 to-transparent"></div>
        
        {/* Category Badge */}
        <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-full border-2 font-black text-xs uppercase tracking-wider ${getCategoryColor(post.category)}`}>
          {postCategory}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
          <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {postAuthorName}</span>
        </div>

        <h3 className="font-bold text-2xl text-white group-hover:text-purple-400 transition-colors leading-tight">
          {postTitle}
        </h3>

        <p className="text-slate-400 text-sm line-clamp-2 font-medium leading-relaxed">
          {postExcerpt}
        </p>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-slate-500 text-xs font-bold">{postDate}</span>
          <div className="p-3 bg-slate-800 rounded-2xl group-hover:bg-purple-600 transition-colors">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
