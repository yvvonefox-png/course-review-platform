import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Calendar, Eye } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Blog() {
  const { data: allPosts, isLoading: allLoading } = trpc.blog.list.useQuery({ limit: 20 });
  const { data: promotionPosts } = trpc.blog.byCategory.useQuery({ category: "網站宣傳", limit: 10 });
  const { data: tutorialPosts } = trpc.blog.byCategory.useQuery({ category: "教學文章", limit: 10 });

  const BlogCard = ({ post }: { post: any }) => (
    <Link href={`/blog/${post.id}`}>
      <Card className="h-full hover:border-primary transition-all cursor-pointer card-shadow hover:card-shadow-hover">
        {post.coverImage && (
          <div className="w-full h-48 bg-gradient-primary/10 overflow-hidden rounded-t-lg">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary">{post.category || "通用"}</Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              <span>{post.viewCount}</span>
            </div>
          </div>
          <CardTitle className="line-clamp-2">{post.title}</CardTitle>
          <CardDescription className="line-clamp-3">
            {post.excerpt || post.content.slice(0, 100) + "..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-light">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container max-w-6xl">
          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-gradient">Blog</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              分享課程學習經驗、教學技巧和平台最新資訊
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">全部文章</TabsTrigger>
              <TabsTrigger value="promotion">網站宣傳</TabsTrigger>
              <TabsTrigger value="tutorial">教學文章</TabsTrigger>
            </TabsList>

            {/* All Posts */}
            <TabsContent value="all" className="space-y-8">
              {allLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : allPosts && allPosts.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allPosts.map((post: any) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-lg text-muted-foreground">暫無文章</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Promotion Posts */}
            <TabsContent value="promotion" className="space-y-8">
              {promotionPosts && promotionPosts.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {promotionPosts.map((post: any) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-lg text-muted-foreground">暫無網站宣傳文章</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Tutorial Posts */}
            <TabsContent value="tutorial" className="space-y-8">
              {tutorialPosts && tutorialPosts.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tutorialPosts.map((post: any) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-lg text-muted-foreground">暫無教學文章</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
