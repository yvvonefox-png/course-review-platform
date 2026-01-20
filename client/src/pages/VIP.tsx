import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

const VIP_FEATURES = [
  "无限查看所有课程评价",
  "无需消耗积分即可浏览",
  "优先审核评价内容",
  "专属 VIP 标识",
  "每月赠送 100 积分",
  "优先客服支持",
  "独家学习资源推荐",
  "课程优惠信息推送",
];

const VIP_PLANS = [
  {
    id: "monthly",
    name: "月度会员",
    price: 29,
    period: "月",
    description: "适合短期需求",
  },
  {
    id: "quarterly",
    name: "季度会员",
    price: 79,
    period: "季",
    description: "更优惠的选择",
    badge: "推荐",
  },
  {
    id: "yearly",
    name: "年度会员",
    price: 299,
    period: "年",
    description: "最划算的方案",
    badge: "最划算",
  },
];

export default function VIP() {
  const { user, isAuthenticated } = useAuth();
  const { data: vipStatus } = trpc.vip.status.useQuery(undefined, { enabled: isAuthenticated });

  const handlePurchase = (planId: string) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    // 这里将在配置 Stripe 后实现支付功能
    toast.info("支付功能正在配置中,请稍后再试");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-light">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-full mb-6">
              <Crown className="h-5 w-5" />
              <span className="font-semibold">升级 VIP 会员</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              解锁全部评价
              <br />
              <span className="text-gradient">畅享学习之旅</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              成为 VIP 会员,无限制查看所有课程评价,让你的学习决策更加明智
            </p>
          </div>

          {/* Current Status */}
          {isAuthenticated && vipStatus?.isVip && (
            <Card className="mb-12 border-2 border-primary bg-gradient-to-r from-primary/5 to-primary/10">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">你已经是 VIP 会员</h3>
                      <p className="text-sm text-muted-foreground">
                        有效期至 {vipStatus.vipExpiresAt ? new Date(vipStatus.vipExpiresAt).toLocaleDateString() : "永久"}
                      </p>
                    </div>
                  </div>
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">VIP 会员特权</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {VIP_FEATURES.map((feature, index) => (
                <Card key={index} className="border-2 hover:border-primary transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-sm">{feature}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">选择你的方案</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {VIP_PLANS.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative ${
                    plan.badge
                      ? "border-2 border-primary shadow-lg scale-105"
                      : "border-2 hover:border-primary transition-all"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-primary text-white px-4 py-1">
                        {plan.badge}
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-8 pt-8">
                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-6">
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-5xl font-bold text-primary">¥{plan.price}</span>
                        <span className="text-muted-foreground">/ {plan.period}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handlePurchase(plan.id)}
                      className={`w-full ${
                        plan.badge
                          ? "bg-gradient-primary hover:opacity-90"
                          : "bg-primary hover:bg-primary/90"
                      }`}
                      disabled={vipStatus?.isVip}
                    >
                      {vipStatus?.isVip ? "已是会员" : "立即购买"}
                    </Button>
                    <div className="mt-6 space-y-3">
                      {VIP_FEATURES.slice(0, 4).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">常见问题</h2>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">VIP 会员可以退款吗?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    购买后 7 天内,如果您对服务不满意,可以申请全额退款。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">会员到期后会自动续费吗?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    不会自动续费。会员到期后,您可以选择是否继续购买。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">VIP 会员可以转让吗?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    VIP 会员权益仅限购买账号使用,不支持转让或共享。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">如何联系客服?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    如有任何问题,请通过网站底部的联系方式与我们联系,VIP 会员享有优先支持。
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
