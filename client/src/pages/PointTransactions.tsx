import { useAuth } from "@/_core/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { format } from "date-fns";

export default function PointTransactions() {
  const { user } = useAuth();
  const { data: transactions, isLoading } = trpc.points.transactions.useQuery({});

  const getTransactionTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      earn_review: "分享評價",
      earn_vip: "VIP 獎勵",
      spend_view: "查看評價",
      spend_vip: "升級 VIP",
      admin_adjust: "管理員調整",
    };
    return typeMap[type] || type;
  };

  const getTransactionTypeColor = (type: string) => {
    if (type.startsWith("earn")) return "bg-green-100 text-green-800";
    if (type.startsWith("spend")) return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const isPositive = (amount: number) => amount > 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-light">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/profile">
              <a className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                返回個人中心
              </a>
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">積分交易記錄</CardTitle>
              <CardDescription>
                查看您的所有積分交易歷史,包括獲得和消費的積分
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">載入中...</p>
                </div>
              ) : !transactions || transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">暫無交易記錄</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-shrink-0">
                          {isPositive(transaction.amount) ? (
                            <div className="p-2 bg-green-100 rounded-full">
                              <TrendingUp className="h-5 w-5 text-green-600" />
                            </div>
                          ) : (
                            <div className="p-2 bg-red-100 rounded-full">
                              <TrendingDown className="h-5 w-5 text-red-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                              {getTransactionTypeLabel(transaction.type)}
                            </h3>
                            <Badge
                              variant="secondary"
                              className={getTransactionTypeColor(transaction.type)}
                            >
                              {transaction.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(transaction.createdAt).toLocaleString('zh-TW')}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`text-right font-bold text-lg ${
                          isPositive(transaction.amount)
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {isPositive(transaction.amount) ? "+" : ""}
                        {transaction.amount}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
