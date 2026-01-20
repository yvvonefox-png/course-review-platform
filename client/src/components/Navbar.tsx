import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, PenLine, Crown, LogIn } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";

export function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80">
              <BookOpen className="h-6 w-6" />
              <span>課程評價網</span>
            </a>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/">
              <a className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                首頁
              </a>
            </Link>
            <Link href="/courses">
              <a className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                瀏覽課程
              </a>
            </Link>
            <Link href="/blog">
              <a className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                Blog
              </a>
            </Link>
            <button className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center gap-1">
              <Search className="h-4 w-4" />
              搜尋
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/submit-review">
                  <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-1">
                    <PenLine className="h-4 w-4" />
                    分享評價
                  </Button>
                </Link>
                
                {!user?.isVip && (
                  <Link href="/vip">
                    <Button variant="default" size="sm" className="hidden sm:flex items-center gap-1 bg-gradient-primary">
                      <Crown className="h-4 w-4" />
                      升級 VIP
                    </Button>
                  </Link>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user?.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user?.name || "使用者"}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <a className="w-full">個人中心</a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my-reviews">
                        <a className="w-full">我的評價</a>
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <a className="w-full">管理後台</a>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      登出
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                <a href={getLoginUrl()}>
                  <LogIn className="h-4 w-4 mr-1" />
                  登入
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
