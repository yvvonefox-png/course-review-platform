import { useState, useEffect } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, ArrowLeft, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function SubmitReview() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const preselectedCourseId = searchParams.get("courseId");

  const [selectedCourseId, setSelectedCourseId] = useState<string>(preselectedCourseId || "");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [hoveredRating, setHoveredRating] = useState(0);

  const { data: courses } = trpc.courses.list.useQuery({ limit: 100 });
  const createReviewMutation = trpc.reviews.create.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourseId) {
      toast.error("請選擇課程");
      return;
    }

    if (!content.trim()) {
      toast.error("請填寫評價內容");
      return;
    }

    try {
      await createReviewMutation.mutateAsync({
        courseId: parseInt(selectedCourseId),
        rating,
        title: title.trim() || undefined,
        content: content.trim(),
        isAnonymous,
      });

      toast.success("評價提交成功！等待審核後將會發布。您獲得了 30 積分獎勵！");
      
      // 清空表单
      setSelectedCourseId("");
      setRating(5);
      setTitle("");
      setContent("");
      setIsAnonymous(true);

      // 刷新数据
      utils.reviews.byUser.invalidate();
      utils.points.balance.invalidate();

      // 跳转到我的评价页面
      setTimeout(() => {
        navigate("/my-reviews");
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || "提交失敗,請稍後重試");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-light">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container max-w-3xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/courses">
              <a className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                返回
              </a>
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">分享課程評價</CardTitle>
              <CardDescription>
                分享您的真實學習體驗,幫助其他學員做出更好的選擇。提交評價後您將獲得 30 積分獎勵!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Course Selection */}
                <div className="space-y-2">
                  <Label htmlFor="course">選擇課程 *</Label>
                  <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                    <SelectTrigger id="course">
                      <SelectValue placeholder="請選擇要評價的課程" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses?.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <Label>評分 *</Label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= (hoveredRating || rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-lg font-semibold">{rating}.0</span>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">評價標題 (可選)</Label>
                  <Input
                    id="title"
                    placeholder="用一句話概括您的評價"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">評價內容 *</Label>
                  <Textarea
                    id="content"
                    placeholder="分享您的學習體驗、課程質量、講師水平等..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                    className="resize-none"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    {content.length} 字符
                  </p>
                </div>

                {/* Anonymous */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="anonymous" className="text-base">匿名發布</Label>
                    <p className="text-sm text-muted-foreground">
                      開啟後,您的評價將不會顯示您的姓名
                    </p>
                  </div>
                  <Switch
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                  />
                </div>

                {/* Info Box */}
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
                  <h4 className="font-semibold text-primary">评价须知</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>请确保评价内容真实客观,不包含虚假信息</li>
                    <li>不得包含人身攻击、辱骂或其他不当言论</li>
                    <li>评价将由管理员审核后发布</li>
                    <li>审核通过后你将获得 10 积分奖励</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90"
                    disabled={createReviewMutation.isPending}
                  >
                    {createReviewMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        提交中...
                      </>
                    ) : (
                      "提交评价"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/courses")}
                  >
                    取消
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
