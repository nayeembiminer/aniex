import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { AnimeCard } from "@/components/anime-card";
import { MovieCard } from "@/components/movie-card";
import { EpisodeCard } from "@/components/episode-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ArrowRight, Play, Plus } from "lucide-react";
import { AnimeSeries, Movie, Episode } from "@shared/schema";

export default function HomePage() {
  // Fetch trending anime series
  const { data: trendingAnime, isLoading: isLoadingAnime } = useQuery<AnimeSeries[]>({
    queryKey: ['/api/anime'],
    staleTime: 60000, // 1 minute
  });

  // Fetch popular movies
  const { data: popularMovies, isLoading: isLoadingMovies } = useQuery<Movie[]>({
    queryKey: ['/api/movies'],
    staleTime: 60000, // 1 minute
  });

  // Fetch latest episodes
  const { data: latestEpisodes, isLoading: isLoadingEpisodes } = useQuery<Episode[]>({
    queryKey: ['/api/episodes'],
    staleTime: 60000, // 1 minute
  });

  // Set document title
  useEffect(() => {
    document.title = "AniEx - Anime Streaming Platform";
  }, []);

  // Get featured anime (first one with a banner)
  const featuredAnime = trendingAnime?.find(anime => anime.bannerImage) || trendingAnime?.[0];

  return (
    <MainLayout>
      {/* Hero Banner */}
      <div className="relative rounded-xl overflow-hidden mb-8 h-96">
        {isLoadingAnime ? (
          <Skeleton className="w-full h-full" />
        ) : featuredAnime ? (
          <>
            <img 
              src={featuredAnime.bannerImage || "https://images.unsplash.com/photo-1541562232579-512a21360020?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&h=400&q=80"} 
              alt={featuredAnime.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 banner-gradient flex items-end">
              <div className="p-6 md:p-8 md:w-1/2">
                <span className="bg-primary text-white px-2 py-1 rounded text-xs font-semibold mb-2 inline-block">FEATURED</span>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{featuredAnime.title}</h1>
                <p className="text-gray-300 mb-4">{featuredAnime.description.length > 120 ? `${featuredAnime.description.substring(0, 120)}...` : featuredAnime.description}</p>
                <div className="flex flex-wrap gap-2">
                  {featuredAnime.genres?.slice(0, 3).map((genre, index) => (
                    <span key={index} className="bg-muted text-foreground px-2 py-1 rounded-full text-xs">{genre}</span>
                  ))}
                </div>
                <div className="flex space-x-3 mt-4">
                  <Link href={`/anime/${featuredAnime.id}`}>
                    <Button className="bg-secondary hover:bg-secondary/90 text-white">
                      <Play className="mr-2 h-4 w-4" /> Watch Now
                    </Button>
                  </Link>
                  <Button variant="outline" className="bg-muted/30 text-white hover:bg-muted/50 border-muted">
                    <Plus className="mr-2 h-4 w-4" /> Add to List
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/20">
            <p className="text-muted-foreground">No featured content available</p>
          </div>
        )}
      </div>

      {/* Trending Now Section */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-foreground">Trending Now</h2>
          <Link href="/anime" className="text-primary hover:underline flex items-center">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        {isLoadingAnime ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : trendingAnime && trendingAnime.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {trendingAnime.slice(0, 5).map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No trending anime available</p>
        )}
      </div>

      {/* Popular Movies Section */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-foreground">Popular Movies</h2>
          <Link href="/movies" className="text-primary hover:underline flex items-center">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        {isLoadingMovies ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-40 md:h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : popularMovies && popularMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {popularMovies.slice(0, 4).map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No popular movies available</p>
        )}
      </div>

      {/* New Episodes Section */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-foreground">New Episodes</h2>
          <Link href="/anime" className="text-primary hover:underline flex items-center">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        {isLoadingEpisodes ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-28 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : latestEpisodes && latestEpisodes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {latestEpisodes.slice(0, 3).map((episode) => (
              <EpisodeCard 
                key={episode.id} 
                episode={episode}
                // For simplicity, we're just showing the episode
                // In a real app, we'd fetch the anime name from the anime ID
                animeName={`Anime #${episode.animeId}`}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No new episodes available</p>
        )}
      </div>
    </MainLayout>
  );
}
