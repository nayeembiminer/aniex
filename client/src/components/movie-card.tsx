import { Movie } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Play } from "lucide-react";
import { Link } from "wouter";

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/movies/${movie.id}`}>
      <Card className="anime-card-hover rounded-lg overflow-hidden bg-card cursor-pointer">
        <div className="relative h-40 md:h-48">
          <img
            src={movie.coverImage || "https://via.placeholder.com/400x250?text=No+Image"}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
            <h3 className="font-semibold text-white line-clamp-1">{movie.title}</h3>
          </div>
        </div>
        <CardContent className="p-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              {movie.year} • {movie.duration ? `${movie.duration} min` : "Unknown"}
            </span>
            {movie.rating && (
              <div className="flex items-center">
                <Star className="h-3 w-3 text-accent fill-accent" />
                <span className="text-xs ml-1">{movie.rating}</span>
              </div>
            )}
          </div>
          <Button variant="default" size="sm" className="w-full mt-2 bg-primary">
            <Play className="h-4 w-4 mr-1" /> Watch
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
