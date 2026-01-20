import { useParams } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";

export default function BlogDetail() {
  const params = useParams();
  const postId = parseInt(params.id as string);
  
  const { data: post, isLoading } = trpc.blog.byId.useQuery({ id: postId });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-light">
        <Navbar />
        <main className="flex-1 py-12">
          <div className="container max-w-4xl">
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded"></div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-light">
        <Navbar />
        <main className="flex-1 py-12">
          <div className="container max-w-4xl">
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-lg text-muted-foreground mb-4">文章不存在</p>
                <Button asChild>
                  <Link href="/blog">
                    <a>返回 Blog</a>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-light">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          {/* Back Button */}
          <Button asChild variant="ghost" className="mb-8">
            <Link href="/blog">
              <a className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                返回 Blog
              </a>
            </Link>
          </Button>

          {/* Article Header */}
          <article className="space-y-8">
            {/* Cover Image */}
            {post.coverImage && (
              <div className="w-full h-96 bg-gradient-primary/10 rounded-lg overflow-hidden">
                <img 
                  src={post.coverImage} 
                  alt={post.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Title and Meta */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {post.category && <Badge variant="secondary">{post.category}</Badge>}
              </div>
              
              <h1 className="text-5xl font-bold">{post.title}</h1>
              
              <div className="flex items-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{post.viewCount} 次閱讀</span>
                </div>
              </div>

              {post.excerpt && (
                <p className="text-xl text-muted-foreground">{post.excerpt}</p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-border"></div>

            {/* Content */}
            <div className="prose prose-sm max-w-none">
              <Streamdown>{post.content}</Streamdown>
            </div>

            {/* Tags */}
            {post.tags && (
              <div className="flex flex-wrap gap-2 pt-8 border-t border-border">
                {JSON.parse(post.tags || "[]").map((tag: string) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            )}
          </article>

          {/* Related Articles */}
          <div className="mt-16 pt-8 border-t border-border">
            <h2 className="text-2xl font-bold mb-6">相關文章</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Card key={i} className="hover:border-primary transition-all cursor-pointer">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">相關文章標題 {i}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      這是相關文章的摘要...
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
