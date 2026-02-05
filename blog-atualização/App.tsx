
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import BlogHome from './pages/BlogHome';
import BlogPost from './pages/BlogPost';
import GameModes from './pages/GameModes';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import HowToPlay from './pages/HowToPlay';
import { MOCK_POSTS } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'blog' | 'post' | 'modos' | 'privacidade' | 'termos' | 'como-jogar'>('blog');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Sync state with hash for basic routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/post/')) {
        const id = hash.replace('#/post/', '');
        setSelectedPostId(id);
        setCurrentView('post');
      } else if (hash === '#/modos') {
        setCurrentView('modos');
        setSelectedPostId(null);
      } else if (hash === '#/privacidade') {
        setCurrentView('privacidade');
        setSelectedPostId(null);
      } else if (hash === '#/termos') {
        setCurrentView('termos');
        setSelectedPostId(null);
      } else if (hash === '#/como-jogar') {
        setCurrentView('como-jogar');
        setSelectedPostId(null);
      } else {
        // Default is blog (covers #/ or empty)
        setCurrentView('blog');
        setSelectedPostId(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectPost = (id: string) => {
    window.location.hash = `#/post/${id}`;
  };

  const handleBackToBlog = () => {
    window.location.hash = '#/';
  };

  const selectedPost = MOCK_POSTS.find(p => p.id === selectedPostId);

  return (
    <Layout>
      {currentView === 'blog' && (
        <BlogHome onSelectPost={handleSelectPost} />
      )}
      {currentView === 'modos' && (
        <GameModes />
      )}
      {currentView === 'como-jogar' && (
        <HowToPlay />
      )}
      {currentView === 'privacidade' && (
        <PrivacyPolicy />
      )}
      {currentView === 'termos' && (
        <TermsOfUse />
      )}
      {currentView === 'post' && selectedPost && (
        <BlogPost post={selectedPost} onBack={handleBackToBlog} />
      )}
      {currentView === 'post' && !selectedPost && (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
           <div className="w-32 h-32 bg-rose-500/20 rounded-3xl border-4 border-rose-500 flex items-center justify-center mb-8">
             <span className="text-6xl text-rose-500 font-black">?</span>
           </div>
           <h2 className="text-4xl font-heading text-white mb-4">MENSAGEM PERDIDA NO ESPAÇO</h2>
           <p className="text-slate-400 text-xl max-w-md mb-8">O artigo que você está procurando foi ejetado da nave ou nunca existiu.</p>
           <button 
            onClick={handleBackToBlog}
            className="px-8 py-4 bg-purple-600 border-b-6 border-purple-800 rounded-2xl font-black text-white hover:brightness-110 active:translate-y-2 active:border-b-0 transition-all"
           >
            VOLTAR AO BLOG
           </button>
        </div>
      )}
    </Layout>
  );
};

export default App;
