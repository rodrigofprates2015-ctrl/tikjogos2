import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { Post } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug;

  const { data: post, isLoading } = useQuery<Post>({
    queryKey: [`/api/posts/${slug}`],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Skeleton className="h-12 w-3/4 mb-8" />
        <Skeleton className="aspect-video w-full mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Artigo não encontrado</h1>
        <Link href="/blog">
          <Button variant="outline">Voltar ao Blog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/blog">
          <Button variant="ghost" className="mb-8 hover:bg-transparent -ml-4 text-[#4a7298] font-bold uppercase text-xs tracking-widest">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para o blog
          </Button>
        </Link>

        <article>
          <header className="mb-12">
            <div className="flex items-center gap-4 text-[11px] text-[#666] font-bold uppercase tracking-wider mb-4">
              <span className="text-[#4a7298]">{post.category}</span>
              <span>By {post.author}</span>
              <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString('pt-BR') : ''}</span>
            </div>
            <h1 className="text-5xl font-black text-[#333] leading-[1.1] tracking-tighter mb-8">
              {post.title}
            </h1>
            {post.imageUrl && (
              <div className="aspect-video overflow-hidden mb-12">
                <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}
          </header>

          <div 
            className="prose prose-lg max-w-none text-[#444] leading-relaxed
              prose-headings:text-[#333] prose-headings:font-black prose-headings:tracking-tighter
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
              prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
              prose-p:mb-6
              prose-strong:text-[#333]
              prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6
              prose-li:mb-2"
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }}
          />
        </article>
      </div>
    </div>
  );
}
