import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Star, CheckCircle, XCircle, Loader2, Edit, Trash2, Plus, Coins, Users, Package, BookOpen } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [processingReviewId, setProcessingReviewId] = useState<number | null>(null);
  const [pointsAdjustOpen, setPointsAdjustOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [pointsAmount, setPointsAmount] = useState("");
  const [pointsDescription, setPointsDescription] = useState("");
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [coursePlatformId, setCoursePlatformId] = useState<string>("");
  const [coursePrice, setCoursePrice] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseUrl, setCourseUrl] = useState("");

  const { data: pendingReviews, isLoading: reviewsLoading, refetch: refetchReviews } = trpc.reviews.pending.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: members, isLoading: membersLoading, refetch: refetchMembers } = trpc.members.list.useQuery(
    { limit: 50, offset: 0 },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const { data: platforms, isLoading: platformsLoading, refetch: refetchPlatforms } = trpc.platforms.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: courses, isLoading: coursesLoading, refetch: refetchCourses } = trpc.courses.list.useQuery(
    { limit: 100, offset: 0 },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const approveMutation = trpc.reviews.approve.useMutation();
  const rejectMutation = trpc.reviews.reject.useMutation();
  const adjustPointsMutation = trpc.members.adjustPoints.useMutation();
  const createPlatformMutation = trpc.platforms.create.useMutation();
  const deletePlatformMutation = trpc.platforms.delete.useMutation();
  const createCourseMutation = trpc.courses.create.useMutation();
  const deleteCourseMutation = trpc.courses.delete.useMutation();
  const utils = trpc.useUtils();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-light">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>請先登入</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <a href={getLoginUrl()}>登入</a>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-light">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>權限不足</CardTitle>
              <CardDescription>您沒有訪問管理後臺的權限</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  const handleApprove = async (reviewId: number) => {
    setProcessingReviewId(reviewId);
    try {
      await approveMutation.mutateAsync({ reviewId });
      toast.success("評價已通過審核");
      refetchReviews();
      utils.courses.list.invalidate();
      utils.courses.byId.invalidate();
    } catch (error: any) {
      toast.error(error.message || "操作失敗");
    } finally {
      setProcessingReviewId(null);
    }
  };

  const handleReject = async (reviewId: number) => {
    setProcessingReviewId(reviewId);
    try {
      await rejectMutation.mutateAsync({ reviewId });
      toast.success("評價已拒絕");
      refetchReviews();
    } catch (error: any) {
      toast.error(error.message || "操作失敗");
    } finally {
      setProcessingReviewId(null);
    }
  };

  const handleAdjustPoints = async () => {
    if (!selectedUserId || !pointsAmount || !pointsDescription) {
      toast.error("請填寫所有欄位");
      return;
    }

    try {
      await adjustPointsMutation.mutateAsync({
        userId: selectedUserId,
        amount: parseInt(pointsAmount),
        description: pointsDescription,
      });
      toast.success("積分已調整");
      setPointsAdjustOpen(false);
      setPointsAmount("");
      setPointsDescription("");
      setSelectedUserId(null);
      refetchMembers();
    } catch (error: any) {
      toast.error(error.message || "操作失敗");
    }
  };

  const handleCreateCourse = async () => {
    if (!courseName || !coursePlatformId) {
      toast.error("請填寫課程名稱和平台");
      return;
    }

    try {
      await createCourseMutation.mutateAsync({
        name: courseName,
        title: courseName,
        platformId: parseInt(coursePlatformId),
        price: coursePrice ? parseFloat(coursePrice) : 0,
        description: courseDescription,
        url: courseUrl,
      });
      toast.success("課程已新增");
      setCourseDialogOpen(false);
      setCourseName("");
      setCoursePlatformId("");
      setCoursePrice("");
      setCourseDescription("");
      setCourseUrl("");
      refetchCourses();
    } catch (error: any) {
      toast.error(error.message || "操作失敗");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-light">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">管理後臺</h1>
            <p className="text-lg text-muted-foreground">審核和管理平台內容</p>
          </div>

          <Tabs defaultValue="reviews" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="reviews">
                待審核評價 ({pendingReviews?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="courses">
                課程管理
              </TabsTrigger>
              <TabsTrigger value="members">
                會員管理
              </TabsTrigger>
              <TabsTrigger value="platforms">
                課程平台
              </TabsTrigger>
              <TabsTrigger value="stats">
                統計數據
              </TabsTrigger>
            </TabsList>

            {/* 評價審核 */}
            <TabsContent value="reviews" className="space-y-6">
              {reviewsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : pendingReviews && pendingReviews.length > 0 ? (
                <div className="space-y-6">
                  {pendingReviews.map((review: any) => (
                    <Card key={review.id} className="card-shadow">
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
                          <Badge variant="secondary">待審核</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                          {review.content}
                        </p>
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleApprove(review.id)}
                            disabled={processingReviewId === review.id}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {processingReviewId === review.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            通過
                          </Button>
                          <Button
                            onClick={() => handleReject(review.id)}
                            disabled={processingReviewId === review.id}
                            variant="destructive"
                            className="flex-1"
                          >
                            {processingReviewId === review.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-2" />
                            )}
                            拒絕
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-lg text-muted-foreground">暫無待審核的評價</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* 課程管理 */}
            <TabsContent value="courses" className="space-y-6">
              <div className="flex justify-end mb-4">
                <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      新增課程
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>新增課程</DialogTitle>
                      <DialogDescription>
                        添加新的課程到平台
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">課程名稱 *</label>
                        <Input
                          placeholder="輸入課程名稱"
                          value={courseName}
                          onChange={(e) => setCourseName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">課程平台 *</label>
                        <Select value={coursePlatformId} onValueChange={setCoursePlatformId}>
                          <SelectTrigger>
                            <SelectValue placeholder="選擇平台" />
                          </SelectTrigger>
                          <SelectContent>
                            {platforms?.map((p: any) => (
                              <SelectItem key={p.id} value={p.id.toString()}>
                                {p.displayName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">價格</label>
                        <Input
                          type="number"
                          placeholder="輸入課程價格"
                          value={coursePrice}
                          onChange={(e) => setCoursePrice(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">課程描述</label>
                        <Textarea
                          placeholder="輸入課程描述"
                          value={courseDescription}
                          onChange={(e) => setCourseDescription(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">課程連結</label>
                        <Input
                          placeholder="輸入課程連結"
                          value={courseUrl}
                          onChange={(e) => setCourseUrl(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={handleCreateCourse}
                        disabled={createCourseMutation.isPending}
                        className="w-full"
                      >
                        {createCourseMutation.isPending ? "新增中..." : "新增課程"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {coursesLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : courses && courses.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {courses.map((course: any) => (
                    <Card key={course.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">{course.name}</h3>
                            <p className="text-sm text-muted-foreground">{course.platformName}</p>
                            {course.price > 0 && (
                              <p className="text-sm font-medium mt-2">NT$ {course.price.toFixed(0)}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              try {
                                await deleteCourseMutation.mutateAsync({ id: course.id });
                                toast.success("課程已刪除");
                                refetchCourses();
                              } catch (error: any) {
                                toast.error(error.message || "操作失敗");
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      {course.description && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-lg text-muted-foreground">暫無課程,請新增課程</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* 會員管理 */}
            <TabsContent value="members" className="space-y-6">
              {membersLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : members && members.length > 0 ? (
                <div className="space-y-4">
                  {members.map((member: any) => (
                    <Card key={member.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">{member.name || "未命名用戶"}</h3>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                          <div className="text-right">
                            {member.isVip && (
                              <Badge className="mb-2 bg-gradient-primary">VIP</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Coins className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">積分</p>
                              <p className="text-lg font-semibold">{member.points}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">加入日期</p>
                            <p className="text-sm">{new Date(member.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">VIP 到期</p>
                            <p className="text-sm">
                              {member.vipExpiresAt ? new Date(member.vipExpiresAt).toLocaleDateString() : "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Dialog open={pointsAdjustOpen && selectedUserId === member.id} onOpenChange={(open) => {
                            setPointsAdjustOpen(open);
                            if (!open) setSelectedUserId(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedUserId(member.id)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                調整積分
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>調整會員積分</DialogTitle>
                                <DialogDescription>
                                  為 {member.name} 調整積分
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">積分變動</label>
                                  <Input
                                    type="number"
                                    placeholder="輸入正數增加,負數扣除"
                                    value={pointsAmount}
                                    onChange={(e) => setPointsAmount(e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">原因</label>
                                  <Input
                                    placeholder="調整原因"
                                    value={pointsDescription}
                                    onChange={(e) => setPointsDescription(e.target.value)}
                                  />
                                </div>
                                <Button
                                  onClick={handleAdjustPoints}
                                  disabled={adjustPointsMutation.isPending}
                                  className="w-full"
                                >
                                  {adjustPointsMutation.isPending ? "處理中..." : "確認調整"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-lg text-muted-foreground">暫無會員</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* 課程平台管理 */}
            <TabsContent value="platforms" className="space-y-6">
              <div className="flex justify-end mb-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      新增平台
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>新增課程平台</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input placeholder="平台名稱 (如: udemy)" id="platform-name" />
                      <Input placeholder="顯示名稱 (如: Udemy)" id="platform-display" />
                      <Input placeholder="平台描述" id="platform-desc" />
                      <Button
                        onClick={async () => {
                          const name = (document.getElementById("platform-name") as HTMLInputElement).value;
                          const displayName = (document.getElementById("platform-display") as HTMLInputElement).value;
                          const description = (document.getElementById("platform-desc") as HTMLInputElement).value;
                          
                          if (!name || !displayName) {
                            toast.error("請填寫必要欄位");
                            return;
                          }
                          
                          try {
                            await createPlatformMutation.mutateAsync({ name, displayName, description });
                            toast.success("平台已新增");
                            refetchPlatforms();
                          } catch (error: any) {
                            toast.error(error.message || "操作失敗");
                          }
                        }}
                        className="w-full"
                      >
                        新增
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {platformsLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : platforms && platforms.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {platforms.map((platform: any) => (
                    <Card key={platform.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{platform.displayName}</h3>
                            <p className="text-sm text-muted-foreground">{platform.description}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              try {
                                await deletePlatformMutation.mutateAsync({ id: platform.id });
                                toast.success("平台已刪除");
                                refetchPlatforms();
                              } catch (error: any) {
                                toast.error(error.message || "操作失敗");
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-lg text-muted-foreground">暫無課程平台</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* 統計數據 */}
            <TabsContent value="stats">
              <div className="grid md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>待審核評價</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-yellow-600">
                      {pendingReviews?.length || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>課程總數</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-primary">
                      {courses?.length || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>會員總數</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-primary">
                      {members?.length || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>課程平台</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-primary">
                      {platforms?.length || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
