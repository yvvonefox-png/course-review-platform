import { useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, Filter } from "lucide-react";
import { trpc } from "@/lib/trpc";

const CATEGORIES = [
  "全部",
  "编程开发",
  "设计创意",
  "商业管理",
  "语言学习",
  "职业技能",
  "兴趣爱好",
  "学术考试",
];

export default function Courses() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [searchInput, setSearchInput] = useState("");

  // 根据条件查询课程
  const { data: courses, isLoading } = searchKeyword
    ? trpc.courses.search.useQuery({ keyword: searchKeyword, limit: 50 })
    : selectedCategory !== "全部"
    ? trpc.courses.byCategory.useQuery({ category: selectedCategory, limit: 50 })
    : trpc.courses.list.useQuery({ limit: 50 });

  const handleSearch = () => {
    setSearchKeyword(searchInput);
    setSelectedCategory("全部");
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSearchKeyword("");
    setSearchInput("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-light">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">浏览课程</h1>
            <p className="text-lg text-muted-foreground">
              发现优质课程，查看真实评价，做出明智选择
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 space-y-6">
            {/* Search Bar */}
            <div className="flex gap-3 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="搜索课程名称、讲师或机构..."
                  className="pl-10"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90">
                搜索
              </Button>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Filter className="h-4 w-4" />
                分类:
              </div>
              {CATEGORIES.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryChange(category)}
                  className={selectedCategory === category ? "bg-primary" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Results Info */}
          <div className="mb-6 text-sm text-muted-foreground">
            {searchKeyword && `搜索 "${searchKeyword}" 的结果`}
            {selectedCategory !== "全部" && !searchKeyword && `分类: ${selectedCategory}`}
            {courses && ` · 共 ${courses.length} 个课程`}
          </div>

          {/* Course Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-muted rounded w-full mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : courses && courses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Link key={course.id} href={`/courses/${course.id}`}>
                  <Card className="h-full hover:border-primary transition-all cursor-pointer card-shadow hover:card-shadow-hover">
                    {course.imageUrl && (
                      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                        <img
                          src={course.imageUrl}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
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
                      {course.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {course.description}
                        </p>
                      )}
                      <div className="text-sm text-muted-foreground">
                        {course.reviewCount} 条评价
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground mb-4">暂无课程</p>
              <Button variant="outline" onClick={() => {
                setSearchKeyword("");
                setSearchInput("");
                setSelectedCategory("全部");
              }}>
                清除筛选
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
