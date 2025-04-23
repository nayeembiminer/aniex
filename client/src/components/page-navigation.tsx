import { useCallback } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

interface PageNavigationProps {
  title?: string;
  showHomeButton?: boolean;
  className?: string;
}

export function PageNavigation({ title, showHomeButton = true, className = "" }: PageNavigationProps) {
  const [location] = useLocation();
  
  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // If no history, navigate programmatically to home
      window.location.href = '/';
    }
  }, []);
  
  // Don't show on home page
  if (location === "/") return null;
  
  return (
    <div className={`flex items-center mb-6 ${className}`}>
      <Button 
        variant="outline" 
        size="sm" 
        className="mr-2" 
        onClick={goBack}
        title="Go back to previous page"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </Button>
      
      {showHomeButton && (
        <Link href="/">
          <Button 
            variant="ghost" 
            size="sm"
            title="Go to home page"
          >
            <Home className="h-4 w-4 mr-1" />
            Home
          </Button>
        </Link>
      )}
      
      {title && (
        <h2 className="text-lg font-medium ml-4">{title}</h2>
      )}
    </div>
  );
}