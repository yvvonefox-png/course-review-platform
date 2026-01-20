import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calendar, DollarSign, Package } from "lucide-react";

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const { data: orders, isLoading } = trpc.orders.list.useQuery(undefined, { enabled: isAuthenticated });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-light">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>請先登入</CardTitle>
              <CardDescription>登入後查看你的訂單紀錄</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <a href={getLoginUrl()}>
                  登入
                </a>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "已完成";
      case "pending":
        return "待處理";
      case "failed":
        return "失敗";
      case "refunded":
        return "已退款";
      default:
        return status;
    }
  };

  const getProductTypeText = (productType: string) => {
    switch (productType) {
      case "vip_monthly":
        return "VIP 月度會員";
      case "vip_quarterly":
        return "VIP 季度會員";
      case "vip_yearly":
        return "VIP 年度會員";
      default:
        return productType;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-light">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          {/* Back Button */}
          <Button asChild variant="ghost" className="mb-8">
            <Link href="/profile">
              <a className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                返回個人中心
              </a>
            </Link>
          </Button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">訂單紀錄</h1>
            <p className="text-muted-foreground">查看你的所有訂單和支付歷史</p>
          </div>

          {/* Orders List */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order: any) => (
                <Card key={order.id} className="hover:border-primary transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Package className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-semibold">{getProductTypeText(order.productType)}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">訂單號: {order.orderNumber}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {order.currency} {parseFloat(order.amount).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>{order.description || "VIP 會員升級"}</span>
                      </div>
                      {order.stripePaymentIntentId && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">支付 ID:</span> {order.stripePaymentIntentId.slice(0, 20)}...
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg text-muted-foreground mb-4">暫無訂單</p>
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/vip">
                    <a>升級 VIP</a>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
