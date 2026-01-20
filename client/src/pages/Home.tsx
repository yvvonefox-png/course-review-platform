import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, Shield, Users, ArrowRight, BookOpen, Award } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  const { data: courses, isLoading: coursesLoading } = trpc.courses.list.useQuery({ limit: 8 });
  const { data: articles, isLoading: articlesLoading } = trpc.articles.list.useQuery({ limit: 3 });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-light">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                課程帶路，
                <br />
                <span className="text-gradient">讓你學習不踩雷</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                學習不必再靠運氣！查看數萬條真實課程評價，讓我們幫你掌握學習路徑，聰明避雷，找到滿意課程。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
                  <Link href="/courses">
                    <a className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      瀏覽課程
                    </a>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8">
                  <Link href="/submit-review">
                    <a>分享你的評價</a>
                  </Link>
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">10,000+</div>
                  <div className="text-sm text-muted-foreground mt-1">課程評價</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">5,000+</div>
                  <div className="text-sm text-muted-foreground mt-1">精選評價</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">1,000+</div>
                  <div className="text-sm text-muted-foreground mt-1">優質課程</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground mt-1">合作機構</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">讓好學員與好課程相遇</h2>
              <p className="text-lg text-muted-foreground">我們以資訊對稱，翻轉學習市場</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="border-2 hover:border-primary transition-colors card-shadow hover:card-shadow-hover">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>資訊對稱</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    課程評價網的核心——「交換」。只要你願意分享，就能交換他人的學習經驗，就是如此簡單。
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors card-shadow hover:card-shadow-hover">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>信念</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    我們要做的，不只是揭露資訊。我們想讓好課程被好學員看見，以自然法則淘汰不合格的課程。
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors card-shadow hover:card-shadow-hover">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>堅持</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    只要你說的是事實、不惡意攻擊，我們就願意盡最大的努力，來保護你貢獻的珍貴經驗。
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-20 bg-gradient-light">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">說實話不用怕最安心</h2>
              <p className="text-lg text-muted-foreground">匿名有保護 審核來把關</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">積分</h3>
                <p className="text-muted-foreground">
                  課程評價網的核心機制。每次分享評價都能獲得積分，可以用它來換取大家的珍貴學習經驗。
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">匿名分享</h3>
                <p className="text-muted-foreground">
                  匿名發聲與完善的分享機制，都是為了能讓你安心分享真實的學習體驗。
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">專人審核</h3>
                <p className="text-muted-foreground">
                  為了提供給大家有品質的好內容，每則課程評價都會由專人審核後上架。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Hot Courses Section */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">熱門課程</h2>
                <p className="text-muted-foreground">最受歡迎的優質課程</p>
              </div>
              <Button asChild variant="outline">
                <Link href="/courses">
                  <a className="flex items-center gap-2">
                    查看全部
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Link>
              </Button>
            </div>

            {coursesLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {courses?.slice(0, 8).map((course) => (
                  <Link key={course.id} href={`/courses/${course.id}`}>
                    <Card className="h-full hover:border-primary transition-all cursor-pointer card-shadow hover:card-shadow-hover">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="secondary">{course.category || "通用"}</Badge>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{course.rating}</span>
                          </div>
                        </div>
                        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                        <CardDescription className="line-clamp-1">
                          {course.instructor || course.institution}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground">
                          {course.reviewCount} 條評價
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Articles Section */}
        {articles && articles.length > 0 && (
          <section className="py-20 bg-gradient-light">
            <div className="container">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">專欄精選</h2>
                  <p className="text-muted-foreground">學習經驗與技巧分享</p>
                </div>
                <Button asChild variant="outline">
                  <Link href="/blog">
                    <a className="flex items-center gap-2">
                      查看全部
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Link>
                </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {articles.map((article) => (
                  <Link key={article.id} href={`/blog/${article.id}`}>
                    <Card className="h-full hover:border-primary transition-all cursor-pointer card-shadow hover:card-shadow-hover">
                      <CardHeader>
                        <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                        <CardDescription className="line-clamp-3">
                          {article.excerpt || article.content.slice(0, 100) + "..."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{article.viewCount} 次閱讀</span>
                          <span>{new Date(article.publishedAt || "").toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">關於我們</h3>
              <p className="text-sm text-muted-foreground">
                課程評價網致力於打造最透明的課程評價平台，幫助學員找到最適合的課程。
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">快速連結</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/courses"><a className="hover:text-foreground">瀏覽課程</a></Link></li>
                <li><Link href="/blog"><a className="hover:text-foreground">Blog</a></Link></li>
                <li><Link href="/submit-review"><a className="hover:text-foreground">分享評價</a></Link></li>
                <li><Link href="/vip"><a className="hover:text-foreground">升級 VIP</a></Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">幫助中心</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">常見問題</a></li>
                <li><a href="#" className="hover:text-foreground">使用指南</a></li>
                <li><a href="#" className="hover:text-foreground">聯絡我們</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">法律資訊</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">服務條款</a></li>
                <li><a href="#" className="hover:text-foreground">隱私政策</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2024 課程評價網. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
