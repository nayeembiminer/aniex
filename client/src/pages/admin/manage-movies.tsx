import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { MovieForm } from "@/components/admin/movie-form";
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
  Clock,
} from "lucide-react";
import { Movie } from "@shared/schema";

export default function ManageMovies() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("all");
  const [sortOption, setSortOption] = useState("latest");

  // Fetch movies
  const { data: moviesData, isLoading } = useQuery<Movie[]>({
    queryKey: ['/api/movies'],
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/movies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/movies'] });
      toast({
        title: "Movie deleted",
        description: "The movie has been deleted successfully.",
      });
      setIsDeleteModalOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete movie: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Set document title
  useEffect(() => {
    document.title = "Manage Movies - AniEx Admin";
  }, []);

  // Handle editing a movie
  const handleEdit = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsEditModalOpen(true);
  };

  // Handle deleting a movie
  const handleDelete = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsDeleteModalOpen(true);
  };

  // Filter and sort movies
  const filteredMovies = moviesData
    ? moviesData
        .filter((movie) => {
          // Search filter
          const matchesSearch =
            searchQuery === "" ||
            movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            movie.description.toLowerCase().includes(searchQuery.toLowerCase());

          // Genre filter
          const matchesGenre =
            genreFilter === "all" ||
            (movie.genres &&
              movie.genres.some(
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
            case "year":
              return (b.year || 0) - (a.year || 0);
            case "latest":
            default:
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
        })
    : [];

  // Get unique genres from all movies
  const allGenres = moviesData
    ? Array.from(
        new Set(
          moviesData.flatMap((movie) => movie.genres || [])
        )
      ).sort()
    : [];

  return (
    <AdminLayout title="Manage Movies">
      <div className="flex justify-between items-center mb-6">
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Movie
        </Button>
      </div>

      <div className="bg-card rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center flex-wrap gap-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search movies..."
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
                <SelectItem value="year">Sort By: Year</SelectItem>
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
          ) : filteredMovies.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">
                No movies found matching your criteria
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Genres</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovies.map((movie) => (
                  <TableRow key={movie.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className="h-12 w-8 flex-shrink-0 overflow-hidden rounded">
                          <img
                            className="h-full w-full object-cover"
                            src={movie.coverImage || "https://via.placeholder.com/50x75?text=No+Image"}
                            alt={movie.title}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium">{movie.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {movie.description.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{movie.year || "N/A"}</TableCell>
                    <TableCell>
                      {movie.duration ? (
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                          <span>{movie.duration} min</span>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {movie.genres?.slice(0, 2).map((genre, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                        {movie.genres && movie.genres.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{movie.genres.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{movie.rating || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(movie)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(movie)}>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(`/movies/${movie.id}`, '_blank')}>
                            <ExternalLink className="mr-2 h-4 w-4" />
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

      {/* Add Movie Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Movie</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new anime movie to the platform.
            </DialogDescription>
          </DialogHeader>
          <MovieForm onSuccess={() => setIsAddModalOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Movie Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Movie</DialogTitle>
            <DialogDescription>
              Update the details of this movie.
            </DialogDescription>
          </DialogHeader>
          {selectedMovie && (
            <MovieForm
              movie={selectedMovie}
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
              Are you sure you want to delete "{selectedMovie?.title}"? This action cannot be undone.
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
              onClick={() => selectedMovie && deleteMutation.mutate(selectedMovie.id)}
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
