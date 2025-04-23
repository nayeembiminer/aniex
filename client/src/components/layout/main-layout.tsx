import { ReactNode } from "react";
import { Navbar } from "./navbar";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  MessageCircle,
  Heart
} from "lucide-react";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      
      <footer className="bg-card border-t border-border mt-10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <Link href="/" className="flex items-center">
                <span className="text-accent font-bold text-2xl">Ani<span className="text-primary">Ex</span></span>
              </Link>
              <p className="text-muted-foreground mt-2 max-w-md">
                Your ultimate destination for anime streaming. Watch thousands of episodes and movies in HD quality.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-foreground font-semibold mb-3">Explore</h3>
                <ul className="space-y-2">
                  <li><Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link></li>
                  <li><Link href="/anime" className="text-muted-foreground hover:text-foreground">Anime</Link></li>
                  <li><Link href="/movies" className="text-muted-foreground hover:text-foreground">Movies</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-foreground font-semibold mb-3">Genres</h3>
                <ul className="space-y-2">
                  <li><Link href="/search?genre=action" className="text-muted-foreground hover:text-foreground">Action</Link></li>
                  <li><Link href="/search?genre=adventure" className="text-muted-foreground hover:text-foreground">Adventure</Link></li>
                  <li><Link href="/search?genre=comedy" className="text-muted-foreground hover:text-foreground">Comedy</Link></li>
                  <li><Link href="/search?genre=drama" className="text-muted-foreground hover:text-foreground">Drama</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-foreground font-semibold mb-3">Legal</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Terms of Service</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">DMCA</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Contact Us</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} AniEx. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
