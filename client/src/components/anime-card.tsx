import { AnimeSeries } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { Link } from "wouter";

interface AnimeCardProps {
  anime: AnimeSeries;
}

export function AnimeCard({ anime }: AnimeCardProps) {
  return (
    <Link href={`/anime/${anime.id}`}>
      <Card className="anime-card-hover rounded-lg overflow-hidden bg-card h-full cursor-pointer">
        <div className="relative h-48">
          <img
            src={anime.coverImage || "https://via.placeholder.com/250x350?text=No+Image"}
            alt={anime.title}
            className="w-full h-full object-cover"
          />
          {anime.status === "new" && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-accent text-accent-foreground font-bold">NEW</Badge>
            </div>
          )}
          {anime.status === "hot" && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-secondary text-white font-bold">HOT</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="font-semibold text-foreground line-clamp-1">{anime.title}</h3>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-muted-foreground">
              {anime.status === "completed" ? "Completed" : "Ongoing"}
            </span>
            {anime.rating && (
              <div className="flex items-center">
                <Star className="h-3 w-3 text-accent fill-accent" />
                <span className="text-xs ml-1">{anime.rating}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
