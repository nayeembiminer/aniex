import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertMovieSchema, Movie } from "@shared/schema";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { Loader2, Plus, Trash2 } from "lucide-react";

// Extend the schema with validation
const formSchema = insertMovieSchema.extend({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  year: z.string().transform((val) => (val ? parseInt(val) : undefined)),
  duration: z.string().transform((val) => (val ? parseInt(val) : undefined)),
});

type FormValues = z.infer<typeof formSchema>;

interface VideoSource {
  serverName: string;
  serverNumber: number;
  videoUrl: string;
}

interface MovieFormProps {
  movie?: Movie;
  onSuccess?: () => void;
}

// Multi-select options for genres
const genreOptions = [
  { label: "Action", value: "Action" },
  { label: "Adventure", value: "Adventure" },
  { label: "Comedy", value: "Comedy" },
  { label: "Drama", value: "Drama" },
  { label: "Fantasy", value: "Fantasy" },
  { label: "Horror", value: "Horror" },
  { label: "Mecha", value: "Mecha" },
  { label: "Music", value: "Music" },
  { label: "Mystery", value: "Mystery" },
  { label: "Psychological", value: "Psychological" },
  { label: "Romance", value: "Romance" },
  { label: "Sci-Fi", value: "Sci-Fi" },
  { label: "Slice of Life", value: "Slice of Life" },
  { label: "Sports", value: "Sports" },
  { label: "Supernatural", value: "Supernatural" },
  { label: "Thriller", value: "Thriller" }
];

export function MovieForm({ movie, onSuccess }: MovieFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedGenres, setSelectedGenres] = useState<string[]>(movie?.genres || []);
  const [videoSources, setVideoSources] = useState<VideoSource[]>([
    { serverName: "Server 1", serverNumber: 1, videoUrl: "" }
  ]);
  
  const isEditing = !!movie;
  
  // If editing, fetch existing video sources
  const { data: existingSources, isLoading: isLoadingSources } = useQuery({
    queryKey: [`/api/movies/${movie?.id}/sources`],
    enabled: !!movie,
    onSuccess: (data) => {
      if (data && data.length > 0) {
        setVideoSources(data.map(source => ({
          serverName: source.serverName,
          serverNumber: source.serverNumber,
          videoUrl: source.videoUrl
        })));
      }
    }
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: movie ? {
      ...movie,
      year: movie.year?.toString() || "",
      duration: movie.duration?.toString() || ""
    } : {
      title: "",
      description: "",
      coverImage: "",
      bannerImage: "",
      year: "",
      duration: "",
      rating: "",
      genres: []
    }
  });

  const movieMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Add selected genres to the form data
      const dataWithGenres = {
        ...values,
        genres: selectedGenres
      };
      
      if (isEditing) {
        const res = await apiRequest("PUT", `/api/admin/movies/${movie.id}`, dataWithGenres);
        return await res.json();
      } else {
        const res = await apiRequest("POST", "/api/admin/movies", dataWithGenres);
        return await res.json();
      }
    },
    onSuccess: async (data) => {
      // After movie is created/updated, handle video sources
      try {
        for (const source of videoSources) {
          if (!source.videoUrl) continue;
          
          const sourceData = {
            ...source,
            movieId: data.id,
            quality: "HD"
          };
          
          await apiRequest("POST", "/api/admin/sources", sourceData);
        }
        
        queryClient.invalidateQueries({ queryKey: ['/api/movies'] });
        queryClient.invalidateQueries({ queryKey: [`/api/movies/${data.id}/sources`] });
        
        toast({
          title: `Movie ${isEditing ? 'updated' : 'created'} successfully`,
          description: `${form.getValues().title} has been ${isEditing ? 'updated' : 'added'} to the database.`,
        });
        
        if (onSuccess) onSuccess();
      } catch (error) {
        toast({
          title: "Failed to save video sources",
          description: (error as Error).message,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: `Failed to ${isEditing ? 'update' : 'create'} movie`,
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (values: FormValues) => {
    movieMutation.mutate(values);
  };
  
  const addVideoSource = () => {
    const nextServerNumber = videoSources.length + 1;
    setVideoSources([
      ...videoSources,
      { serverName: `Server ${nextServerNumber}`, serverNumber: nextServerNumber, videoUrl: "" }
    ]);
  };
  
  const removeVideoSource = (index: number) => {
    setVideoSources(videoSources.filter((_, i) => i !== index));
  };
  
  const updateVideoSource = (index: number, field: keyof VideoSource, value: string) => {
    const updatedSources = [...videoSources];
    updatedSources[index] = { ...updatedSources[index], [field]: value };
    setVideoSources(updatedSources);
  };

  const isLoading = isLoadingSources || movieMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter movie title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Release year" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (min)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g. 120" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. 4.5" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="col-span-1">
            <FormItem>
              <FormLabel>Genres</FormLabel>
              <MultiSelect
                selected={selectedGenres}
                options={genreOptions}
                onChange={setSelectedGenres}
                placeholder="Select genres"
              />
            </FormItem>
          </div>
          
          <FormField
            control={form.control}
            name="coverImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter cover image URL" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="bannerImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banner Image URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter banner image URL" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter movie description" 
                    className="min-h-[120px]" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Video Sources</h3>
          
          <div className="space-y-4">
            {videoSources.map((source, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-1/4">
                  <Input
                    value={source.serverName}
                    onChange={(e) => updateVideoSource(index, 'serverName', e.target.value)}
                    placeholder="Server name"
                  />
                </div>
                <div className="w-1/6">
                  <Input
                    type="number"
                    value={source.serverNumber}
                    onChange={(e) => updateVideoSource(index, 'serverNumber', parseInt(e.target.value))}
                    placeholder="Server #"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    value={source.videoUrl}
                    onChange={(e) => updateVideoSource(index, 'videoUrl', e.target.value)}
                    placeholder="Video URL"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeVideoSource(index)}
                  disabled={videoSources.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={addVideoSource}
            disabled={videoSources.length >= 7}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Server
          </Button>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={onSuccess}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Update' : 'Create'} Movie
          </Button>
        </div>
      </form>
    </Form>
  );
}
