import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { MainLayout } from "@/components/layout/main-layout";
import { AnimeCard } from "@/components/anime-card";
import { EpisodeCard } from "@/components/episode-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Play, Search, CalendarDays, Clock, Star } from "lucide-react";
import { AnimeSeries, Episode } from "@shared/schema";

export default function AnimePage() {
  const params = useParams();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const animeId = params?.id ? parseInt(params.id) : undefined;
  
  // Fetch all anime series or specific anime details
  const { data: animeData, isLoading: isLoadingAnime } = useQuery<AnimeSeries[] | AnimeSeries>({
    queryKey: animeId ? [`/api/anime/${animeId}`] : ['/api/anime'],
    staleTime: 60000, // 1 minute
  });

  // If specific anime, fetch its episodes
  const { data: episodes, isLoading: isLoadingEpisodes } = useQuery<Episode[]>({
    queryKey: [`/api/anime/${animeId}/episodes`],
    enabled: !!animeId,
    staleTime: 60000, // 1 minute
  });

  // For search functionality
  const filteredAnime = Array.isArray(animeData) && searchQuery
    ? animeData.filter(anime => 
        anime.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (anime.genres && anime.genres.some(genre => 
          genre.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      )
    : Array.isArray(animeData) ? animeData : [];

  // Pagination
  const totalPages = Math.ceil(filteredAnime.length / itemsPerPage);
  const paginatedAnime = filteredAnime.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  // Set document title
  useEffect(() => {
    if (animeId && !Array.isArray(animeData)) {
      document.title = `${animeData?.title || 'Anime Details'} - AniEx`;
    } else {
      document.title = "Anime Series - AniEx";
    }
  }, [animeId, animeData]);

  // Single Anime View
  if (animeId) {
    const anime = !Array.isArray(animeData) ? animeData : null;

    if (isLoadingAnime) {
      return (
        <MainLayout>
          <div className="space-y-6">
            <Skeleton className="w-full h-64 rounded-xl" />
            <Skeleton className="w-1/3 h-8" />
            <Skeleton className="w-full h-24" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="w-full h-28" />
              ))}
            </div>
          </div>
        </MainLayout>
      );
    }

    if (!anime) {
      return (
        <MainLayout>
          <div className="flex flex-col items-center justify-center py-12">
            <h2 className="text-2xl font-bold mb-4">Anime Not Found</h2>
            <p className="text-muted-foreground mb-6">The anime you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/anime")}>Browse All Anime</Button>
          </div>
        </MainLayout>
      );
    }

    return (
      <MainLayout>
        {/* Anime Banner */}
        <div className="relative rounded-xl overflow-hidden mb-8 h-64 md:h-80">
          <img 
            src={anime.bannerImage || anime.coverImage || "https://images.unsplash.com/photo-1541562232579-512a21360020?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&h=400&q=80"} 
            alt={anime.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 banner-gradient flex items-end">
            <div className="p-6 md:p-8 w-full">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="hidden md:block h-40 w-28 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={anime.coverImage || "https://via.placeholder.com/140x200?text=No+Cover"} 
                    alt={anime.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{anime.title}</h1>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {anime.genres?.map((genre, index) => (
                      <Badge key={index} variant="secondary" className="bg-muted text-foreground">{genre}</Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                    {anime.year && (
                      <div className="flex items-center">
                        <CalendarDays className="mr-1 h-4 w-4" />
                        <span>{anime.year}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>{anime.status === "completed" ? "Completed" : "Ongoing"}</span>
                    </div>
                    {anime.rating && (
                      <div className="flex items-center">
                        <Star className="mr-1 h-4 w-4 fill-accent text-accent" />
                        <span>{anime.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Anime Content */}
        <Tabs defaultValue="episodes">
          <TabsList className="mb-6">
            <TabsTrigger value="episodes">Episodes</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="episodes">
            {isLoadingEpisodes ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="w-full h-28" />
                ))}
              </div>
            ) : episodes && episodes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {episodes.map((episode) => (
                  <EpisodeCard 
                    key={episode.id} 
                    episode={episode}
                    animeName={anime.title}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No episodes available for this anime yet.</p>
                <Button variant="outline" onClick={() => navigate("/anime")}>
                  Browse Other Anime
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="details">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Synopsis</h3>
                <p className="text-muted-foreground">{anime.description}</p>
              </div>
              
              {anime.genres && anime.genres.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map((genre, index) => (
                      <Badge key={index} variant="outline">{genre}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span>{anime.status === "completed" ? "Completed" : "Ongoing"}</span>
                    </div>
                    {anime.year && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Released:</span>
                        <span>{anime.year}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2">
                    {anime.rating && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rating:</span>
                        <span>{anime.rating}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Episodes:</span>
                      <span>{episodes?.length || "Unknown"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </MainLayout>
    );
  }

  // Anime Listing View
  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Anime Series</h1>
        <form onSubmit={handleSearch} className="w-full md:w-auto">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search anime..."
              className="pl-10 pr-4 w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </form>
      </div>

      {isLoadingAnime ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : paginatedAnime.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            {paginatedAnime.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      ) : searchQuery ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">No Results Found</h2>
          <p className="text-muted-foreground mb-6">
            No anime matches your search for "{searchQuery}".
          </p>
          <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No anime series available</p>
        </div>
      )}
    </MainLayout>
  );
}
