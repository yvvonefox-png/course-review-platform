import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Star, Crown, Coins, PenLine, Clock, CheckCircle, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const { data: pointsData } = trpc.points.balance.useQuery(undefined, { enabled: isAuthenticated });
  const { data: vipStatus } = trpc.vip.status.useQuery(undefined, { enabled: isAuthenticated });
  const { data: reviews } = trpc.reviews.byUser.useQuery(undefined, { enabled: isAuthenticated });
  const { data: transactions } = trpc.points.transactions.useQuery({ limit: 10 }, { enabled: isAuthenticated });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-light">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>請先登录</CardTitle>
              <CardDescription>登录後查看您的個人信息</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <a href={getLoginUrl()}>
                  登录
                </a>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const pendingReviews = reviews?.filter(r => r.status === "pending").length || 0;
  const approvedReviews = reviews?.filter(r => r.status === "approved").length || 0;
  const rejectedReviews = reviews?.filter(r => r.status === "rejected").length || 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-light">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container max-w-6xl">
          <h1 className="text-4xl font-bold mb-8">個人中心</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - User Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* User Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                        {user?.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold">{user?.name || "使用者"}</h2>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {vipStatus?.isVip ? (
                    <div className="p-3 bg-gradient-primary text-white rounded-lg flex items-center gap-2">
                      <Crown className="h-5 w-5" />
                      <div>
                        <div className="font-semibold">VIP 會員</div>
                        <div className="text-xs opacity-90">
                          有效期至 {vipStatus.vipExpiresAt ? new Date(vipStatus.vipExpiresAt).toLocaleDateString() : "永久"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button asChild className="w-full bg-gradient-primary">
                      <Link href="/vip">
                        <a className="flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          升級 VIP
                        </a>
                      </Link>
                    </Button>
                  )}
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">當前積分</span>
                    <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                      <Coins className="h-6 w-6" />
                      {pointsData?.points || 0}
                    </div>
                  </div>
                  
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/point-transactions">
                      <a className="flex items-center gap-2">
                        <Coins className="h-4 w-4" />
                        積分交易記錄
                      </a>
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle>我的統計</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <PenLine className="h-4 w-4" />
                      總評價數
                    </div>
                    <span className="font-semibold">{reviews?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      已通過
                    </div>
                    <span className="font-semibold">{approvedReviews}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-yellow-600">
                      <Clock className="h-4 w-4" />
                      待審核
                    </div>
                    <span className="font-semibold">{pendingReviews}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-4 w-4" />
                      未通過
                    </div>
                    <span className="font-semibold">{rejectedReviews}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* My Reviews */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>我的评价</CardTitle>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/my-reviews">
                        <a>查看全部</a>
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {reviews && reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="p-4 border rounded-lg space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < review.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {review.title && (
                                <h4 className="font-semibold mb-1">{review.title}</h4>
                              )}
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {review.content}
                              </p>
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
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">还没有评价</p>
                      <Button asChild className="bg-primary hover:bg-primary/90">
                        <Link href="/submit-review">
                          <a>分享你的第一条评价</a>
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Points History */}
              <Card>
                <CardHeader>
                  <CardTitle>积分记录</CardTitle>
                  <CardDescription>最近的积分变动</CardDescription>
                </CardHeader>
                <CardContent>
                  {transactions && transactions.length > 0 ? (
                    <div className="space-y-3">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div
                            className={`text-lg font-bold ${
                              transaction.amount > 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {transaction.amount > 0 ? "+" : ""}{transaction.amount}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      暂无积分记录
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
