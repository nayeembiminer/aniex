import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Film, Clock, TvIcon, CheckCircle } from "lucide-react";
import { AnimeSeries, Movie, Episode, Server } from "@shared/schema";

export default function AdminDashboard() {
  // Fetch required data
  const { data: animeData, isLoading: isLoadingAnime } = useQuery<AnimeSeries[]>({
    queryKey: ['/api/anime'],
    staleTime: 60000, // 1 minute
  });

  const { data: moviesData, isLoading: isLoadingMovies } = useQuery<Movie[]>({
    queryKey: ['/api/movies'],
    staleTime: 60000, // 1 minute
  });

  const { data: episodesData, isLoading: isLoadingEpisodes } = useQuery<Episode[]>({
    queryKey: ['/api/episodes'],
    staleTime: 60000, // 1 minute
  });

  const { data: serversData, isLoading: isLoadingServers } = useQuery<Server[]>({
    queryKey: ['/api/servers'],
    staleTime: 60000, // 1 minute
  });

  // Set document title
  useEffect(() => {
    document.title = "Admin Dashboard - AniEx";
  }, []);

  // Calculate statistics
  const totalAnime = animeData?.length || 0;
  const totalMovies = moviesData?.length || 0;
  const totalEpisodes = episodesData?.length || 0;
  const activeServers = serversData?.filter(server => server.status === "online").length || 0;
  
  // Calculate total published seasons
  const calculatePublishedSeasons = () => {
    if (!animeData) return 0;
    
    // Count anime with status "completed" or "airing" as published seasons
    const publishedAnime = animeData.filter(anime => 
      anime.status === "completed" || anime.status === "airing"
    );
    
    return publishedAnime.length;
  };
  
  const publishedSeasons = calculatePublishedSeasons();

  // Get recent uploads (combination of anime and movies, sorted by creation date)
  const recentUploads = [
    ...(animeData || []).map(anime => ({
      id: `anime-${anime.id}`,
      title: anime.title,
      type: 'Series',
      image: anime.coverImage,
      date: anime.createdAt,
    })),
    ...(moviesData || []).map(movie => ({
      id: `movie-${movie.id}`,
      title: movie.title,
      type: 'Movie',
      image: movie.coverImage,
      date: movie.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const isLoading = isLoadingAnime || isLoadingMovies || isLoadingEpisodes || isLoadingServers;

  return (
    <AdminLayout title="Dashboard Overview">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary bg-opacity-20 rounded-full p-3">
                <Film className="text-primary h-6 w-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-muted-foreground">Total Anime</h2>
                {isLoadingAnime ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-semibold">{totalAnime}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 bg-opacity-20 rounded-full p-3">
                <CheckCircle className="text-purple-500 h-6 w-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-muted-foreground">Published Seasons</h2>
                {isLoadingAnime ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-semibold">{publishedSeasons}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-secondary bg-opacity-20 rounded-full p-3">
                <Film className="text-secondary h-6 w-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-muted-foreground">Total Movies</h2>
                {isLoadingMovies ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-semibold">{totalMovies}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-accent bg-opacity-20 rounded-full p-3">
                <Clock className="text-accent h-6 w-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-muted-foreground">Total Episodes</h2>
                {isLoadingEpisodes ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-semibold">{totalEpisodes}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 bg-opacity-20 rounded-full p-3">
                <CalendarDays className="text-green-500 h-6 w-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-muted-foreground">Active Servers</h2>
                {isLoadingServers ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-semibold">{activeServers}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Uploads and Server Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-card">
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium mb-4">Recent Uploads</h2>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center p-2">
                    <Skeleton className="w-10 h-10 rounded" />
                    <div className="ml-3 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2 mt-1" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : recentUploads.length > 0 ? (
              <div className="space-y-3">
                {recentUploads.map((item) => (
                  <div key={item.id} className="flex items-center p-2 hover:bg-muted/10 rounded">
                    <div className="w-10 h-10 bg-muted rounded">
                      <img 
                        src={item.image || "https://via.placeholder.com/50x50?text=No+Image"} 
                        alt={item.title} 
                        className="w-full h-full object-cover rounded" 
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        Added {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      item.type === 'Series' ? 'bg-primary text-white' : 'bg-secondary text-white'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-6">No recent uploads</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium mb-4">Server Status</h2>
            {isLoadingServers ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            ) : serversData && serversData.length > 0 ? (
              <div className="space-y-4">
                {serversData.slice(0, 5).map((server) => (
                  <div key={server.id}>
                    <div className="flex justify-between mb-1">
                      <div className="flex items-center">
                        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                          server.status === 'online' ? 'bg-green-500' : 
                          server.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></span>
                        <span className="text-sm font-medium">
                          {server.name} (Server {server.number})
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {Math.floor((server.storageUsed / server.totalStorage) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(server.storageUsed / server.totalStorage) * 100} 
                      className={`h-2 ${
                        server.status === 'online' ? 'bg-muted' : 
                        server.status === 'maintenance' ? 'bg-yellow-500/20' : 'bg-red-500/20'
                      }`}
                      indicatorClassName={
                        server.status === 'online' ? 'bg-green-500' : 
                        server.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-6">No servers configured</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
