import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { VideoPlayer } from "@/components/video-player";
import { EpisodeCard } from "@/components/episode-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { Episode, AnimeSeries } from "@shared/schema";

export default function WatchPage() {
  const params = useParams<{ type: string; id: string }>();
  const [, navigate] = useLocation();
  const { type, id } = params;
  const episodeId = parseInt(id);

  // Fetch episode data
  const { data: episode, isLoading: isLoadingEpisode } = useQuery<Episode>({
    queryKey: [`/api/episodes/${episodeId}`],
    enabled: type === 'episode' && !isNaN(episodeId),
    staleTime: 60000, // 1 minute
  });

  // If we have an episode, fetch its anime series
  const { data: anime, isLoading: isLoadingAnime } = useQuery<AnimeSeries>({
    queryKey: [`/api/anime/${episode?.animeId}`],
    enabled: !!episode?.animeId,
    staleTime: 60000, // 1 minute
  });

  // Fetch all episodes for this anime (for next/prev navigation)
  const { data: allEpisodes, isLoading: isLoadingAllEpisodes } = useQuery<Episode[]>({
    queryKey: [`/api/anime/${episode?.animeId}/episodes`],
    enabled: !!episode?.animeId,
    staleTime: 60000, // 1 minute
  });

  // Find previous and next episodes
  const currentIndex = allEpisodes?.findIndex(ep => ep.id === episodeId) || -1;
  const prevEpisode = currentIndex > 0 ? allEpisodes?.[currentIndex - 1] : null;
  const nextEpisode = currentIndex !== -1 && allEpisodes && currentIndex < allEpisodes.length - 1 
    ? allEpisodes[currentIndex + 1] 
    : null;

  // Set document title
  useEffect(() => {
    if (episode && anime) {
      document.title = `${anime.title} - Episode ${episode.episodeNumber} - AniEx`;
    } else {
      document.title = "Watch - AniEx";
    }
  }, [episode, anime]);

  // If not a valid type, redirect to home
  if (type !== 'episode') {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-2xl font-bold mb-4">Invalid Content Type</h2>
          <p className="text-muted-foreground mb-6">The content type requested is not supported.</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </MainLayout>
    );
  }

  // Loading state
  if (isLoadingEpisode || isLoadingAnime) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="w-full aspect-video rounded-lg" />
          <Skeleton className="w-1/3 h-8" />
          <Skeleton className="w-full h-24" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="w-full h-28" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  // Episode not found
  if (!episode) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-2xl font-bold mb-4">Episode Not Found</h2>
          <p className="text-muted-foreground mb-6">The episode you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/anime")}>Browse Anime</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Video Player */}
      <div className="mb-6">
        <VideoPlayer
          episodeId={episode.id}
          title={`${anime?.title || 'Anime'} - Episode ${episode.episodeNumber}`}
        />
      </div>

      {/* Episode Info */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {anime?.title || 'Anime'} - Episode {episode.episodeNumber}
            </h1>
            <h2 className="text-xl text-muted-foreground">{episode.title}</h2>
          </div>
          
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => anime && navigate(`/anime/${anime.id}`)}
            >
              <Info className="mr-2 h-4 w-4" /> Series Info
            </Button>
          </div>
        </div>
        
        {episode.description && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">{episode.description}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation between episodes */}
      <div className="flex justify-between mb-8">
        <Button
          variant="outline"
          disabled={!prevEpisode}
          onClick={() => prevEpisode && navigate(`/watch/episode/${prevEpisode.id}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous Episode
        </Button>
        
        <Button
          variant="outline"
          disabled={!nextEpisode}
          onClick={() => nextEpisode && navigate(`/watch/episode/${nextEpisode.id}`)}
        >
          Next Episode <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* More Episodes */}
      {allEpisodes && allEpisodes.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">More Episodes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allEpisodes
              .filter(ep => ep.id !== episode.id)
              .slice(0, 4)
              .map(ep => (
                <EpisodeCard
                  key={ep.id}
                  episode={ep}
                  animeName={anime?.title}
                />
              ))}
          </div>
        </div>
      )}
    </MainLayout>
  );
}
