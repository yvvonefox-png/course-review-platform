import { useRoute, Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, BookOpen, Users, PenLine, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function CourseDetail() {
  const [, params] = useRoute("/courses/:id");
  const courseId = params?.id ? parseInt(params.id) : 0;
  const { isAuthenticated } = useAuth();

  const { data: course, isLoading: courseLoading } = trpc.courses.byId.useQuery(
    { id: courseId },
    { enabled: courseId > 0 }
  );

  const { data: reviews, isLoading: reviewsLoading } = trpc.reviews.byCourse.useQuery(
    { courseId },
    { enabled: courseId > 0 }
  );

  if (courseLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-light">
        <Navbar />
        <main className="flex-1 py-12">
          <div className="container">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-light">
        <Navbar />
        <main className="flex-1 py-12">
          <div className="container text-center">
            <h2 className="text-2xl font-bold mb-4">课程不存在</h2>
            <Button asChild variant="outline">
              <Link href="/courses">
                <a>返回课程列表</a>
              </Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-light">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/courses">
              <a className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                返回课程列表
              </a>
            </Link>
          </Button>

          {/* Course Header */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="secondary" className="text-sm">{course.category || "通用"}</Badge>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold">{course.rating}</span>
                    <span className="text-muted-foreground">({course.reviewCount} 条评价)</span>
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
                {course.instructor && (
                  <p className="text-lg text-muted-foreground mb-2">
                    讲师: {course.instructor}
                  </p>
                )}
                {course.institution && (
                  <p className="text-lg text-muted-foreground">
                    机构: {course.institution}
                  </p>
                )}
              </div>

              {course.description && (
                <div>
                  <h2 className="text-2xl font-semibold mb-3">课程介绍</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {course.description}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>课程信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">分类</div>
                      <div className="font-medium">{course.category || "通用"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">评价数量</div>
                      <div className="font-medium">{course.reviewCount} 条</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">平均评分</div>
                      <div className="font-medium">{course.rating} / 5.0</div>
                    </div>
                  </div>
                  <Separator />
                  {isAuthenticated ? (
                    <Button asChild className="w-full bg-primary hover:bg-primary/90">
                      <Link href={`/submit-review?courseId=${course.id}`}>
                        <a className="flex items-center gap-2">
                          <PenLine className="h-4 w-4" />
                          分享你的评价
                        </a>
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild className="w-full bg-primary hover:bg-primary/90">
                      <a href={getLoginUrl()}>
                        登录后分享评价
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Reviews Section */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">课程评价</h2>
              <span className="text-muted-foreground">
                共 {course.reviewCount} 条评价
              </span>
            </div>

            {reviewsLoading ? (
              <div className="space-y-6">
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
              <div className="space-y-6">
                {reviews.map((review) => (
                  <Card key={review.id} className="card-shadow hover:card-shadow-hover transition-all">
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
                        {review.isAnonymous && (
                          <Badge variant="outline">匿名</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {review.content}
                      </p>
                      <div className="mt-4 text-sm text-muted-foreground">
                        {review.viewCount} 次查看
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-lg text-muted-foreground mb-4">
                    暂无评价，成为第一个评价的人吧！
                  </p>
                  {isAuthenticated ? (
                    <Button asChild className="bg-primary hover:bg-primary/90">
                      <Link href={`/submit-review?courseId=${course.id}`}>
                        <a className="flex items-center gap-2">
                          <PenLine className="h-4 w-4" />
                          分享你的评价
                        </a>
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild className="bg-primary hover:bg-primary/90">
                      <a href={getLoginUrl()}>
                        登录后分享评价
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
