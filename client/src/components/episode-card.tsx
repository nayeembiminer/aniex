import { Episode } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { Link } from "wouter";

interface EpisodeCardProps {
  episode: Episode;
  animeName?: string;
}

export function EpisodeCard({ episode, animeName }: EpisodeCardProps) {
  return (
    <Card className="anime-card-hover bg-card rounded-lg overflow-hidden flex flex-col md:flex-row">
      <div className="w-full md:w-1/3 h-28 md:h-auto">
        <img
          src={episode.thumbnail || "https://via.placeholder.com/150x100?text=No+Image"}
          alt={`Episode ${episode.episodeNumber}`}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-3 flex-1">
        <span className="text-xs text-accent font-semibold">EP {episode.episodeNumber}</span>
        <h3 className="font-semibold text-foreground line-clamp-1 mt-1">
          {animeName || ""}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
          {episode.title}
        </p>
        <Link href={`/watch/episode/${episode.id}`}>
          <Button variant="default" size="sm" className="mt-2 bg-primary">
            <Play className="h-3 w-3 mr-1" /> Watch Now
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
