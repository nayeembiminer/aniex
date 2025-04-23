import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { AnimeCard } from "@/components/anime-card";
import { MovieCard } from "@/components/movie-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Search as SearchIcon } from "lucide-react";
import { AnimeSeries, Movie } from "@shared/schema";

export default function SearchPage() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const initialQuery = searchParams.get('q') || '';
  const initialGenre = searchParams.get('genre') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState("anime");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch anime series for search
  const { data: animeData, isLoading: isLoadingAnime } = useQuery<AnimeSeries[]>({
    queryKey: ['/api/anime'],
    staleTime: 60000, // 1 minute
  });

  // Fetch movies for search
  const { data: moviesData, isLoading: isLoadingMovies } = useQuery<Movie[]>({
    queryKey: ['/api/movies'],
    staleTime: 60000, // 1 minute
  });

  // Filter results based on search query or genre
  const filteredAnime = animeData?.filter(anime => {
    const matchesQuery = searchQuery ? 
      anime.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      anime.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
      
    const matchesGenre = initialGenre ? 
      anime.genres?.some(genre => 
        genre.toLowerCase() === initialGenre.toLowerCase()
      ) 
      : true;
      
    return matchesQuery && matchesGenre;
  }) || [];

  const filteredMovies = moviesData?.filter(movie => {
    const matchesQuery = searchQuery ? 
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
      
    const matchesGenre = initialGenre ? 
      movie.genres?.some(genre => 
        genre.toLowerCase() === initialGenre.toLowerCase()
      ) 
      : true;
      
    return matchesQuery && matchesGenre;
  }) || [];

  // Pagination
  const animePages = Math.ceil(filteredAnime.length / itemsPerPage);
  const moviePages = Math.ceil(filteredMovies.length / itemsPerPage);
  
  const paginatedAnime = filteredAnime.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const paginatedMovies = filteredMovies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Update title based on search
  useEffect(() => {
    if (initialGenre) {
      document.title = `${initialGenre} Anime - AniEx`;
    } else if (searchQuery) {
      document.title = `Search: ${searchQuery} - AniEx`;
    } else {
      document.title = "Search - AniEx";
    }
  }, [searchQuery, initialGenre]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    // In a real app, we would update the URL to reflect the search
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const isLoading = isLoadingAnime || isLoadingMovies;
  const hasResults = filteredAnime.length > 0 || filteredMovies.length > 0;
  const searchContext = initialGenre ? `genre: ${initialGenre}` : (searchQuery ? `"${searchQuery}"` : '');

  return (
    <MainLayout>
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">
          {initialGenre ? `${initialGenre} Anime` : 'Search'}
        </h1>
        
        <form onSubmit={handleSearch}>
          <div className="relative max-w-xl">
            <Input
              type="text"
              placeholder="Search anime, movies..."
              className="pl-10 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Button 
              type="submit" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2"
              size="sm"
              disabled={isLoading}
            >
              Search
            </Button>
          </div>
        </form>
      </div>

      {/* Search Results */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : hasResults ? (
        <>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="anime">
                  Anime ({filteredAnime.length})
                </TabsTrigger>
                <TabsTrigger value="movies">
                  Movies ({filteredMovies.length})
                </TabsTrigger>
              </TabsList>
              
              <p className="text-sm text-muted-foreground">
                {(activeTab === "anime" ? filteredAnime.length : filteredMovies.length)} results for {searchContext}
              </p>
            </div>
            
            <TabsContent value="anime">
              {filteredAnime.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                    {paginatedAnime.map((anime) => (
                      <AnimeCard key={anime.id} anime={anime} />
                    ))}
                  </div>
                  
                  {animePages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={animePages}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No anime found matching your search.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="movies">
              {filteredMovies.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                    {paginatedMovies.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                  </div>
                  
                  {moviePages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={moviePages}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No movies found matching your search.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">No Results Found</h2>
          <p className="text-muted-foreground mb-6">
            {searchContext ? `We couldn't find any results matching ${searchContext}.` : 'Try searching for something.'}
          </p>
          {searchQuery && (
            <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
          )}
        </div>
      )}
    </MainLayout>
  );
}
