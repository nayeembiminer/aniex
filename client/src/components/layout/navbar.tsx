import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (path: string) => {
    return location === path ? "bg-primary text-white" : "text-gray-300 hover:text-white hover:bg-muted";
  };

  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <span className="text-accent font-bold text-2xl">Ani<span className="text-primary">Ex</span></span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/")}`}>
                  Home
                </Link>
                <Link href="/anime" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/anime")}`}>
                  Anime
                </Link>
                <Link href="/movies" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/movies")}`}>
                  Movies
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  className="bg-muted rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Search anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </form>
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="ml-4">{user.username}</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.isAdmin && (
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth">
                  <Button className="ml-4 bg-secondary hover:bg-secondary/90 text-white">Login</Button>
                </Link>
              )}
            </div>
          </div>
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-muted focus:outline-none"
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/")}`}>
              Home
            </Link>
            <Link href="/anime" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/anime")}`}>
              Anime
            </Link>
            <Link href="/movies" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/movies")}`}>
              Movies
            </Link>
          </div>
          <div className="px-2 pt-4 pb-3">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                className="w-full bg-muted rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </form>
            
            {user ? (
              <div className="mt-3 space-y-1">
                {user.isAdmin && (
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => {
                      navigate("/admin");
                      setIsMenuOpen(false);
                    }}
                  >
                    Admin Dashboard
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button className="mt-3 w-full bg-secondary hover:bg-secondary/90 text-white">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
