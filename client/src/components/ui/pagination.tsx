import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  // Generate an array of page numbers to display
  const generatePages = () => {
    // If there are 7 or fewer pages, show all
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Otherwise, show a window of pages around the current page with ellipses
    const pages = [1];

    // Start of ellipsis/pages
    if (currentPage > 3) {
      pages.push(-1); // Represents an ellipsis
    }

    // Pages around current
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // End of ellipsis/pages
    if (currentPage < totalPages - 2) {
      pages.push(-2); // Represents an ellipsis
    }

    // Always show the last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = generatePages();

  return (
    <nav className={cn("flex justify-center items-center space-x-2", className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Previous Page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((page, i) => {
        // Render ellipsis
        if (page < 0) {
          return (
            <span
              key={`ellipsis-${i}`}
              className="flex items-center justify-center w-9 h-9 text-muted-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          );
        }

        // Render page button
        return (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            onClick={() => onPageChange(page)}
            className="w-9 h-9 p-0"
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="Next Page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
