
import React from 'react';
import { MOCK_POSTS } from '../constants';
import BlogCard from '../components/BlogCard';
import { Sparkles, TrendingUp, Zap } from 'lucide-react';

interface BlogHomeProps {
  onSelectPost: (id: string) => void;
}

const BlogHome: React.FC<BlogHomeProps> = ({ onSelectPost }) => {
  const featured = MOCK_POSTS.find(p => p.featured) || MOCK_POSTS[0];
  const others = MOCK_POSTS.filter(p => p.id !== featured.id);

  return (
    <div className="animate-fade-in pb-20">
      {/* Hero / Featured Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-12 pb-16 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-rose-600/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto">
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-purple-400 font-black uppercase tracking-widest text-sm">
                <Sparkles className="w-5 h-5" /> CENTRAL DE COMANDO
              </div>
              <h1 className="font-heading text-5xl md:text-7xl text-white">
                Blog do <span className="text-purple-500">Impostor</span>
              </h1>
              <p className="text-slate-400 text-xl max-w-2xl font-medium">
                Notícias galácticas, estratégias de sabotagem e atualizações direto da central TikJogos.
              </p>
            </div>
          </header>

          {/* Featured Post */}
          <div 
            onClick={() => onSelectPost(featured.id)}
            className="group relative rounded-[3rem] border-4 border-purple-500/30 bg-[#242642] overflow-hidden shadow-2xl hover:border-purple-500 transition-all cursor-pointer"
          >
            <div className="flex flex-col lg:flex-row min-h-[500px]">
              <div className="lg:w-3/5 relative overflow-hidden">
                <img src={featured.image} alt={featured.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#242642] via-transparent to-transparent hidden lg:block"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#242642] via-transparent to-transparent lg:hidden"></div>
              </div>
              
              <div className="lg:w-2/5 p-8 lg:p-12 flex flex-col justify-center space-y-6">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-purple-600 rounded-full w-fit border-2 border-purple-800 font-black text-xs uppercase text-white animate-pulse-soft">
                  <TrendingUp className="w-4 h-4" /> DESTAQUE DA SEMANA
                </div>
                
                <h2 className="font-heading text-4xl md:text-5xl text-white leading-[0.9] group-hover:text-purple-400 transition-colors">
                  {featured.title}
                </h2>
                
                <p className="text-slate-400 text-lg font-medium leading-relaxed">
                  {featured.excerpt}
                </p>
                
                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                  <img src={featured.author.avatar} alt={featured.author.name} className="w-12 h-12 rounded-2xl border-2 border-purple-500/50" />
                  <div>
                    <p className="text-white font-black">{featured.author.name}</p>
                    <p className="text-slate-500 text-sm font-bold">{featured.date} • {featured.readTime} leitura</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-500/10 rounded-2xl border-2 border-blue-500/20">
            <Zap className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">MAIS TRANSMISSÕES</h2>
            <p className="text-slate-500 font-medium">Fique por dentro das últimas comunicações da nave</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {others.map((post) => (
            <BlogCard key={post.id} post={post} onClick={() => onSelectPost(post.id)} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default BlogHome;
