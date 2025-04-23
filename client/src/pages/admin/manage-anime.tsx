import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { AnimeForm } from "@/components/admin/anime-form";
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
  Tv,
} from "lucide-react";
import { AnimeSeries } from "@shared/schema";

export default function ManageAnime() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<AnimeSeries | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("all");
  const [sortOption, setSortOption] = useState("latest");

  // Fetch anime series
  const { data: animeData, isLoading } = useQuery<AnimeSeries[]>({
    queryKey: ['/api/anime'],
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/anime/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/anime'] });
      toast({
        title: "Anime deleted",
        description: "The anime series has been deleted successfully.",
      });
      setIsDeleteModalOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete anime: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Set document title
  useEffect(() => {
    document.title = "Manage Anime - AniEx Admin";
  }, []);

  // Handle editing an anime
  const handleEdit = (anime: AnimeSeries) => {
    setSelectedAnime(anime);
    setIsEditModalOpen(true);
  };

  // Handle deleting an anime
  const handleDelete = (anime: AnimeSeries) => {
    setSelectedAnime(anime);
    setIsDeleteModalOpen(true);
  };

  // Filter and sort anime
  const filteredAnime = animeData
    ? animeData
        .filter((anime) => {
          // Search filter
          const matchesSearch =
            searchQuery === "" ||
            anime.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            anime.description.toLowerCase().includes(searchQuery.toLowerCase());

          // Genre filter
          const matchesGenre =
            genreFilter === "all" ||
            (anime.genres &&
              anime.genres.some(
                (genre) => genre.toLowerCase() === genreFilter.toLowerCase()
              ));

          return matchesSearch && matchesGenre;
        })
        .sort((a, b) => {
          // Sort options
          switch (sortOption) {
            case "a-z":
              return a.title.localeCompare(b.title);
            case "z-a":
              return b.title.localeCompare(a.title);
            case "latest":
            default:
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
        })
    : [];

  // Get unique genres from all anime
  const allGenres = animeData
    ? Array.from(
        new Set(
          animeData.flatMap((anime) => anime.genres || [])
        )
      ).sort()
    : [];

  return (
    <AdminLayout title="Manage Anime Series">
      <div className="flex justify-between items-center mb-6">
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Series
        </Button>
      </div>

      <div className="bg-card rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center flex-wrap gap-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search anime..."
              className="pl-10 w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex space-x-2">
            <Select value={genreFilter} onValueChange={setGenreFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Genres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {allGenres.map((genre) => (
                  <SelectItem key={genre} value={genre.toLowerCase()}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Sort By: Latest</SelectItem>
                <SelectItem value="a-z">Sort By: A-Z</SelectItem>
                <SelectItem value="z-a">Sort By: Z-A</SelectItem>
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
          ) : filteredAnime.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">
                No anime series found matching your criteria
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Genres</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnime.map((anime) => (
                  <TableRow key={anime.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded">
                          <img
                            className="h-full w-full object-cover"
                            src={anime.coverImage || "https://via.placeholder.com/50x50?text=No+Image"}
                            alt={anime.title}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium">{anime.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {anime.description.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          anime.status === "ongoing"
                            ? "default"
                            : anime.status === "completed"
                            ? "outline"
                            : "secondary"
                        }
                      >
                        {anime.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {anime.genres?.slice(0, 2).map((genre, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                        {anime.genres && anime.genres.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{anime.genres.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{anime.year || "N/A"}</TableCell>
                    <TableCell>{anime.rating || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(anime)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(anime)}>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(`/anime/${anime.id}`, '_blank')}>
                            <Tv className="mr-2 h-4 w-4" />
                            View
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

      {/* Add Anime Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Anime Series</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new anime series to the platform.
            </DialogDescription>
          </DialogHeader>
          <AnimeForm onSuccess={() => setIsAddModalOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Anime Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Anime Series</DialogTitle>
            <DialogDescription>
              Update the details of this anime series.
            </DialogDescription>
          </DialogHeader>
          {selectedAnime && (
            <AnimeForm
              anime={selectedAnime}
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
              Are you sure you want to delete "{selectedAnime?.title}"? This action cannot be undone.
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
              onClick={() => selectedAnime && deleteMutation.mutate(selectedAnime.id)}
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
