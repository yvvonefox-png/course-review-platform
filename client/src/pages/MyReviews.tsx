import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function MyReviews() {
  const { isAuthenticated } = useAuth();
  const { data: reviews, isLoading } = trpc.reviews.byUser.useQuery(undefined, { enabled: isAuthenticated });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-light">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>请先登录</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <a href={getLoginUrl()}>登录</a>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const pendingReviews = reviews?.filter(r => r.status === "pending") || [];
  const approvedReviews = reviews?.filter(r => r.status === "approved") || [];
  const rejectedReviews = reviews?.filter(r => r.status === "rejected") || [];

  const ReviewCard = ({ review }: { review: any }) => (
    <Card className="card-shadow hover:card-shadow-hover transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            {review.title && (
              <h3 className="text-lg font-semibold mb-2">{review.title}</h3>
            )}
          </div>
          <Badge
            variant={
              review.status === "approved"
                ? "default"
                : review.status === "pending"
                ? "secondary"
                : "destructive"
            }
          >
            {review.status === "approved" ? "已通过" : review.status === "pending" ? "待审核" : "未通过"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed mb-4">
          {review.content}
        </p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{review.viewCount} 次查看</span>
          {review.isAnonymous && <Badge variant="outline">匿名</Badge>}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-light">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/profile">
              <a className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                返回个人中心
              </a>
            </Link>
          </Button>

          <h1 className="text-4xl font-bold mb-8">我的评价</h1>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                全部 ({reviews?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="approved">
                已通过 ({approvedReviews.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                待审核 ({pendingReviews.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                未通过 ({rejectedReviews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-3 bg-muted rounded w-full mb-2"></div>
                        <div className="h-3 bg-muted rounded w-3/4"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : reviews && reviews.length > 0 ? (
                reviews.map((review) => <ReviewCard key={review.id} review={review} />)
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-lg text-muted-foreground mb-4">还没有评价</p>
                    <Button asChild className="bg-primary hover:bg-primary/90">
                      <Link href="/submit-review">
                        <a>分享你的第一条评价</a>
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-6">
              {approvedReviews.length > 0 ? (
                approvedReviews.map((review) => <ReviewCard key={review.id} review={review} />)
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-muted-foreground">暂无已通过的评价</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-6">
              {pendingReviews.length > 0 ? (
                pendingReviews.map((review) => <ReviewCard key={review.id} review={review} />)
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-muted-foreground">暂无待审核的评价</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-6">
              {rejectedReviews.length > 0 ? (
                rejectedReviews.map((review) => <ReviewCard key={review.id} review={review} />)
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-muted-foreground">暂无未通过的评价</p>
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
