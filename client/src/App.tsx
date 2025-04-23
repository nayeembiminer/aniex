import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import AnimePage from "@/pages/anime-page";
import MoviesPage from "@/pages/movies-page";
import WatchPage from "@/pages/watch-page";
import SearchPage from "@/pages/search-page";
import { ProtectedRoute } from "./lib/protected-route";
import AdminDashboard from "./pages/admin/dashboard";
import ManageAnime from "./pages/admin/manage-anime";
import ManageMovies from "./pages/admin/manage-movies";
import ManageEpisodes from "./pages/admin/manage-episodes";
import ManageServers from "./pages/admin/manage-servers";
import UsersManagement from "./pages/admin/users-management";
import Settings from "./pages/admin/settings";
import Seasons from "./pages/admin/seasons";
import { AuthProvider } from "./hooks/use-auth";
import { PageNavigation } from "./components/page-navigation";

function Router() {
  return (
    <>
      {/* Navigation Component for all pages */}
      <div className="container px-4 md:px-6 pt-4">
        <PageNavigation />
      </div>
      
      <Switch>
        {/* Public Routes */}
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/anime" component={AnimePage} />
        <Route path="/anime/:id" component={AnimePage} />
        <Route path="/movies" component={MoviesPage} />
        <Route path="/movies/:id" component={MoviesPage} />
        <Route path="/watch/:type/:id" component={WatchPage} />
        <Route path="/search" component={SearchPage} />
        
        {/* Admin Routes - Protected */}
        <ProtectedRoute path="/admin" component={AdminDashboard} />
        <ProtectedRoute path="/admin/anime" component={ManageAnime} />
        <ProtectedRoute path="/admin/movies" component={ManageMovies} />
        <ProtectedRoute path="/admin/episodes" component={ManageEpisodes} />
        <ProtectedRoute path="/admin/seasons" component={Seasons} />
        <ProtectedRoute path="/admin/servers" component={ManageServers} />
        <ProtectedRoute path="/admin/users" component={UsersManagement} />
        <ProtectedRoute path="/admin/settings" component={Settings} />
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Router />
      </AuthProvider>
    </TooltipProvider>
  );
}

export default App;
