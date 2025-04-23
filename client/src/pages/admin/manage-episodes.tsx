import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { EpisodeForm } from "@/components/admin/episode-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Plus,
  Edit,
  Trash,
  MoreVertical,
  ExternalLink,
} from "lucide-react";
import { Episode, AnimeSeries } from "@shared/schema";

export default function ManageEpisodes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [animeFilter, setAnimeFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");

  // Fetch episodes
  const { data: episodesData, isLoading: isLoadingEpisodes } = useQuery<Episode[]>({
    queryKey: ['/api/episodes'],
  });

  // Fetch anime series for filter and display
  const { data: animeData, isLoading: isLoadingAnime } = useQuery<AnimeSeries[]>({
    queryKey: ['/api/anime'],
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/episodes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/episodes'] });
      toast({
        title: "Episode deleted",
        description: "The episode has been deleted successfully.",
      });
      setIsDeleteModalOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete episode: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Set document title
  useEffect(() => {
    document.title = "Manage Episodes - AniEx Admin";
  }, []);

  // Handle editing an episode
  const handleEdit = (episode: Episode) => {
    setSelectedEpisode(episode);
    setIsEditModalOpen(true);
  };

  // Handle deleting an episode
  const handleDelete = (episode: Episode) => {
    setSelectedEpisode(episode);
    setIsDeleteModalOpen(true);
  };

  // Get anime title by ID
  const getAnimeTitle = (animeId: number) => {
    const anime = animeData?.find(a => a.id === animeId);
    return anime ? anime.title : `Anime #${animeId}`;
  };

  // Filter and sort episodes
  const filteredEpisodes = episodesData
    ? episodesData
        .filter((episode) => {
          // Search filter
          const animeTitle = getAnimeTitle(episode.animeId);
          const matchesSearch =
            searchQuery === "" ||
            episode.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            animeTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            episode.episodeNumber.toString().includes(searchQuery);

          // Anime filter
          const matchesAnime =
            animeFilter === "all" ||
            episode.animeId.toString() === animeFilter;

          return matchesSearch && matchesAnime;
        })
        .sort((a, b) => {
          // Sort options
          switch (sortOption) {
            case "oldest":
              return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case "episode-asc":
              if (a.animeId !== b.animeId) return a.animeId - b.animeId;
              return a.episodeNumber - b.episodeNumber;
            case "episode-desc":
              if (a.animeId !== b.animeId) return a.animeId - b.animeId;
              return b.episodeNumber - a.episodeNumber;
            case "newest":
            default:
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
        })
    : [];

  const isLoading = isLoadingEpisodes || isLoadingAnime;

  return (
    <AdminLayout title="Manage Episodes">
      <div className="flex justify-between items-center mb-6">
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Episode
        </Button>
      </div>

      <div className="bg-card rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center flex-wrap gap-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search episodes..."
              className="pl-10 w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex space-x-2">
            <Select value={animeFilter} onValueChange={setAnimeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Anime Series" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Anime Series</SelectItem>
                {animeData?.map((anime) => (
                  <SelectItem key={anime.id} value={anime.id.toString()}>
                    {anime.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Sort By: Newest</SelectItem>
                <SelectItem value="oldest">Sort By: Oldest</SelectItem>
                <SelectItem value="episode-asc">Sort By: Episode (Asc)</SelectItem>
                <SelectItem value="episode-desc">Sort By: Episode (Desc)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEpisodes.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">
                No episodes found matching your criteria
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Anime</TableHead>
                  <TableHead>Episode</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Added On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEpisodes.map((episode) => (
                  <TableRow key={episode.id}>
                    <TableCell>
                      <div className="font-medium">
                        {getAnimeTitle(episode.animeId)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge>{episode.episodeNumber}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-10 w-16 flex-shrink-0 overflow-hidden rounded">
                          <img
                            className="h-full w-full object-cover"
                            src={episode.thumbnail || "https://via.placeholder.com/160x90?text=No+Thumbnail"}
                            alt={`Episode ${episode.episodeNumber}`}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium">{episode.title}</div>
                          {episode.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {episode.description.substring(0, 50)}...
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(episode.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(episode)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(episode)}>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(`/watch/episode/${episode.id}`, '_blank')}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Watch
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Add Episode Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Episode</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new episode.
            </DialogDescription>
          </DialogHeader>
          <EpisodeForm onSuccess={() => setIsAddModalOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Episode Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Episode</DialogTitle>
            <DialogDescription>
              Update the details of this episode.
            </DialogDescription>
          </DialogHeader>
          {selectedEpisode && (
            <EpisodeForm
              episode={selectedEpisode}
              onSuccess={() => setIsEditModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete Episode {selectedEpisode?.episodeNumber} of {selectedEpisode ? getAnimeTitle(selectedEpisode.animeId) : 'this anime'}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedEpisode && deleteMutation.mutate(selectedEpisode.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
