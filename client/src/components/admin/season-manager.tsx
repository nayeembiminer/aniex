import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { AnimeSeries } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, Check, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export function SeasonManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAnime, setSelectedAnime] = useState<string>("");
  const [seasonNumber, setSeasonNumber] = useState<string>("1");
  
  // Get anime list
  const { data: animeList, isLoading } = useQuery<AnimeSeries[]>({
    queryKey: ['/api/anime'],
    staleTime: 60000,
  });
  
  // Get season data from localStorage
  const [seasons, setSeasons] = useState<{
    animeId: number;
    seasonNumber: string;
    published: boolean;
    episodeCount: number;
  }[]>([]);
  
  useEffect(() => {
    const savedSeasons = localStorage.getItem("anime-seasons");
    if (savedSeasons) {
      try {
        setSeasons(JSON.parse(savedSeasons));
      } catch (e) {
        console.error("Error parsing saved seasons", e);
      }
    }
  }, []);
  
  // Save seasons to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("anime-seasons", JSON.stringify(seasons));
  }, [seasons]);
  
  // Calculate available seasons
  const availableSeasons = animeList ? animeList.reduce((count, anime) => {
    const animeSeasons = seasons.filter(season => season.animeId === anime.id);
    return count + animeSeasons.length;
  }, 0) : 0;
  
  // Calculate published seasons
  const publishedSeasons = seasons.filter(season => season.published).length;
  
  // Add season mutation
  const addSeasonMutation = useMutation({
    mutationFn: async ({ animeId, seasonNumber }: { animeId: number, seasonNumber: string }) => {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 800));
      return { success: true };
    },
    onSuccess: () => {
      if (!selectedAnime) return;
      
      const animeId = parseInt(selectedAnime);
      
      // Check if season already exists
      const existingSeason = seasons.find(
        s => s.animeId === animeId && s.seasonNumber === seasonNumber
      );
      
      if (existingSeason) {
        toast({
          title: "Season already exists",
          description: `Season ${seasonNumber} already exists for this anime.`,
          variant: "destructive",
        });
        return;
      }
      
      // Add new season
      const newSeason = {
        animeId,
        seasonNumber,
        published: false,
        episodeCount: 0,
      };
      
      setSeasons([...seasons, newSeason]);
      
      toast({
        title: "Season added",
        description: `Season ${seasonNumber} has been added successfully.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/anime'] });
    },
    onError: () => {
      toast({
        title: "Failed to add season",
        description: "There was an error adding the season. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Toggle publish status mutation
  const togglePublishMutation = useMutation({
    mutationFn: async ({ animeId, seasonNumber, publish }: { 
      animeId: number, 
      seasonNumber: string, 
      publish: boolean 
    }) => {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 600));
      return { success: true };
    },
    onSuccess: (_, variables) => {
      const { animeId, seasonNumber, publish } = variables;
      
      // Update local state
      setSeasons(prev => prev.map(season => {
        if (season.animeId === animeId && season.seasonNumber === seasonNumber) {
          return { ...season, published: publish };
        }
        return season;
      }));
      
      toast({
        title: publish ? "Season published" : "Season unpublished",
        description: `Season ${seasonNumber} has been ${publish ? "published" : "unpublished"} successfully.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/anime'] });
    },
    onError: () => {
      toast({
        title: "Operation failed",
        description: "There was an error updating the season status. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleAddSeason = () => {
    if (!selectedAnime) {
      toast({
        title: "Select an anime",
        description: "Please select an anime first.",
        variant: "destructive",
      });
      return;
    }
    
    addSeasonMutation.mutate({ 
      animeId: parseInt(selectedAnime), 
      seasonNumber 
    });
  };
  
  const handleTogglePublish = (animeId: number, seasonNumber: string, currentlyPublished: boolean) => {
    togglePublishMutation.mutate({ 
      animeId, 
      seasonNumber, 
      publish: !currentlyPublished 
    });
  };
  
  const getAnimeName = (id: number) => {
    const anime = animeList?.find(a => a.id === id);
    return anime?.title || "Unknown Anime";
  };
  
  const isAddingDisabled = addSeasonMutation.isPending || !selectedAnime;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Season Management</CardTitle>
          <CardDescription>Manage anime seasons and publish status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-muted/10">
              <h3 className="text-sm font-medium mb-2">Available Seasons</h3>
              <div className="flex items-center">
                <div className="text-2xl font-bold">{availableSeasons}</div>
                <Progress
                  value={animeList?.length ? (availableSeasons / animeList.length) * 100 : 0}
                  className="h-2 ml-4 flex-1"
                />
              </div>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/10">
              <h3 className="text-sm font-medium mb-2">Published Seasons</h3>
              <div className="flex items-center">
                <div className="text-2xl font-bold">{publishedSeasons}</div>
                <Progress
                  value={availableSeasons ? (publishedSeasons / availableSeasons) * 100 : 0}
                  className="h-2 ml-4 flex-1"
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Select Anime</label>
              <Select 
                value={selectedAnime} 
                onValueChange={setSelectedAnime}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select anime series" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : animeList && animeList.length > 0 ? (
                    animeList.map((anime) => (
                      <SelectItem key={anime.id} value={anime.id.toString()}>
                        {anime.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="empty" disabled>No anime available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-32">
              <label className="text-sm font-medium mb-2 block">Season #</label>
              <Select value={seasonNumber} onValueChange={setSeasonNumber}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      Season {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="self-end">
              <Button 
                onClick={handleAddSeason} 
                disabled={isAddingDisabled}
                className="w-full"
              >
                {addSeasonMutation.isPending ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <PlusCircle className="mr-2 h-4 w-4" />
                )}
                Add Season
              </Button>
            </div>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted/40 px-4 py-3 flex items-center font-medium">
              <div className="w-1/2">Anime & Season</div>
              <div className="w-1/4 text-center">Status</div>
              <div className="w-1/4 text-center">Actions</div>
            </div>
            <div className="divide-y">
              {seasons.length > 0 ? (
                seasons.map((season, index) => (
                  <div key={index} className="px-4 py-3 flex items-center">
                    <div className="w-1/2">
                      <div className="font-medium">{getAnimeName(season.animeId)}</div>
                      <div className="text-sm text-muted-foreground">Season {season.seasonNumber}</div>
                    </div>
                    <div className="w-1/4 text-center">
                      {season.published ? (
                        <Badge className="bg-green-500 text-white">Published</Badge>
                      ) : (
                        <Badge variant="outline">Draft</Badge>
                      )}
                    </div>
                    <div className="w-1/4 text-center">
                      <Button
                        variant={season.published ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleTogglePublish(season.animeId, season.seasonNumber, season.published)}
                        disabled={togglePublishMutation.isPending}
                      >
                        {togglePublishMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : season.published ? (
                          "Unpublish"
                        ) : (
                          <>
                            <Check className="mr-1 h-4 w-4" />
                            Publish
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-muted-foreground">
                  No seasons added yet. Select an anime and add a season to get started.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}