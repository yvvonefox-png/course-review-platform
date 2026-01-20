import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import SubmitReview from "./pages/SubmitReview";
import Profile from "./pages/Profile";
import MyReviews from "./pages/MyReviews";
import Admin from "./pages/Admin";
import VIP from "./pages/VIP";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Orders from "./pages/Orders";
import PointTransactions from "./pages/PointTransactions";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/courses"} component={Courses} />
      <Route path={"/courses/:id"} component={CourseDetail} />
      <Route path={"/submit-review"} component={SubmitReview} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/my-reviews"} component={MyReviews} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/vip"} component={VIP} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/blog/:id"} component={BlogDetail} />
      <Route path={"/orders"} component={Orders} />
      <Route path={"/point-transactions"} component={PointTransactions} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
