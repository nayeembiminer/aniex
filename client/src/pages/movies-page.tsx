import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { MainLayout } from "@/components/layout/main-layout";
import { MovieCard } from "@/components/movie-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ServerSelect } from "@/components/server-select";
import { VideoPlayer } from "@/components/video-player";
import { Search, CalendarDays, Clock, Star } from "lucide-react";
import { Movie, VideoSource } from "@shared/schema";

export default function MoviesPage() {
  const params = useParams();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const movieId = params?.id ? parseInt(params.id) : undefined;
  
  // Fetch all movies or specific movie details
  const { data: movieData, isLoading: isLoadingMovie } = useQuery<Movie[] | Movie>({
    queryKey: movieId ? [`/api/movies/${movieId}`] : ['/api/movies'],
    staleTime: 60000, // 1 minute
  });

  // For search functionality
  const filteredMovies = Array.isArray(movieData) && searchQuery
    ? movieData.filter(movie => 
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (movie.genres && movie.genres.some(genre => 
          genre.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      )
    : Array.isArray(movieData) ? movieData : [];

  // Pagination
  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
  const paginatedMovies = filteredMovies.slice(
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
    if (movieId && !Array.isArray(movieData)) {
      document.title = `${movieData?.title || 'Movie Details'} - AniEx`;
    } else {
      document.title = "Movies - AniEx";
    }
  }, [movieId, movieData]);

  // Single Movie View
  if (movieId) {
    const movie = !Array.isArray(movieData) ? movieData : null;

    if (isLoadingMovie) {
      return (
        <MainLayout>
          <div className="space-y-6">
            <Skeleton className="w-full aspect-video rounded-xl" />
            <Skeleton className="w-1/3 h-8" />
            <Skeleton className="w-full h-24" />
          </div>
        </MainLayout>
      );
    }

    if (!movie) {
      return (
        <MainLayout>
          <div className="flex flex-col items-center justify-center py-12">
            <h2 className="text-2xl font-bold mb-4">Movie Not Found</h2>
            <p className="text-muted-foreground mb-6">The movie you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/movies")}>Browse All Movies</Button>
          </div>
        </MainLayout>
      );
    }

    return (
      <MainLayout>
        {/* Movie Player */}
        <div className="mb-8">
          <VideoPlayer
            movieId={movie.id}
            title={movie.title}
          />
        </div>

        {/* Movie Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Tabs defaultValue="details">
              <TabsList className="mb-6">
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-4">{movie.title}</h1>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      {movie.year && (
                        <div className="flex items-center">
                          <CalendarDays className="mr-1 h-4 w-4" />
                          <span>{movie.year}</span>
                        </div>
                      )}
                      {movie.duration && (
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          <span>{movie.duration} min</span>
                        </div>
                      )}
                      {movie.rating && (
                        <div className="flex items-center">
                          <Star className="mr-1 h-4 w-4 fill-accent text-accent" />
                          <span>{movie.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {movie.genres?.map((genre, index) => (
                        <Badge key={index} variant="secondary" className="bg-muted text-foreground">{genre}</Badge>
                      ))}
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2">Synopsis</h3>
                    <p className="text-muted-foreground">{movie.description}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <div className="rounded-lg overflow-hidden mb-4">
              <img 
                src={movie.coverImage || "https://via.placeholder.com/400x600?text=No+Cover"} 
                alt={movie.title} 
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Related Movies - In a real implementation, this would fetch related movies */}
            <h3 className="text-xl font-semibold mb-4">You May Also Like</h3>
            <div className="space-y-4">
              <Skeleton className="w-full h-24 rounded-lg" />
              <Skeleton className="w-full h-24 rounded-lg" />
              <Skeleton className="w-full h-24 rounded-lg" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Movies Listing View
  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Anime Movies</h1>
        <form onSubmit={handleSearch} className="w-full md:w-auto">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search movies..."
              className="pl-10 pr-4 w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </form>
      </div>

      {isLoadingMovie ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : paginatedMovies.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {paginatedMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
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
            No movies match your search for "{searchQuery}".
          </p>
          <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No movies available</p>
        </div>
      )}
    </MainLayout>
  );
}
