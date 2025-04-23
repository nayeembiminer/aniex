import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertAnimeSeriesSchema, AnimeSeries } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Loader2 } from "lucide-react";

// Extend the schema with validation
const formSchema = insertAnimeSeriesSchema.extend({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  year: z.string().transform((val) => (val ? parseInt(val) : undefined)),
});

type FormValues = z.infer<typeof formSchema>;

interface AnimeFormProps {
  anime?: AnimeSeries;
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

export function AnimeForm({ anime, onSuccess }: AnimeFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedGenres, setSelectedGenres] = useState<string[]>(anime?.genres || []);
  
  const isEditing = !!anime;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: anime ? {
      ...anime,
      year: anime.year?.toString() || ""
    } : {
      title: "",
      description: "",
      coverImage: "",
      bannerImage: "",
      status: "ongoing",
      year: "",
      rating: "",
      genres: []
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Add selected genres to the form data
      const dataWithGenres = {
        ...values,
        genres: selectedGenres
      };
      
      if (isEditing) {
        const res = await apiRequest("PUT", `/api/admin/anime/${anime.id}`, dataWithGenres);
        return await res.json();
      } else {
        const res = await apiRequest("POST", "/api/admin/anime", dataWithGenres);
        return await res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/anime'] });
      toast({
        title: `Anime ${isEditing ? 'updated' : 'created'} successfully`,
        description: `${form.getValues().title} has been ${isEditing ? 'updated' : 'added'} to the database.`,
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: `Failed to ${isEditing ? 'update' : 'create'} anime`,
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

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
                  <Input placeholder="Enter anime title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="hot">Hot</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
          
          <div className="col-span-1 md:col-span-2">
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
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter anime description" 
                    className="min-h-[120px]" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Update' : 'Create'} Anime
          </Button>
        </div>
      </form>
    </Form>
  );
}
