import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertEpisodeSchema, Episode, AnimeSeries } from "@shared/schema";
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";

// Extend the schema with validation
const formSchema = insertEpisodeSchema.extend({
  title: z.string().min(1, "Title is required"),
  animeId: z.string().transform((val) => parseInt(val)),
  episodeNumber: z.string().transform((val) => parseInt(val)),
});

type FormValues = z.infer<typeof formSchema>;

interface VideoSource {
  serverName: string;
  serverNumber: number;
  videoUrl: string;
}

interface EpisodeFormProps {
  episode?: Episode;
  onSuccess?: () => void;
}

export function EpisodeForm({ episode, onSuccess }: EpisodeFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [videoSources, setVideoSources] = useState<VideoSource[]>([
    { serverName: "Server 1", serverNumber: 1, videoUrl: "" }
  ]);
  
  const isEditing = !!episode;
  
  // Fetch anime series for the dropdown
  const { data: animeSeries, isLoading: isLoadingAnime } = useQuery<AnimeSeries[]>({
    queryKey: ['/api/anime'],
  });
  
  // If editing, fetch existing video sources
  const { data: existingSources, isLoading: isLoadingSources } = useQuery({
    queryKey: [`/api/episodes/${episode?.id}/sources`],
    enabled: !!episode,
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
    defaultValues: episode ? {
      ...episode,
      animeId: episode.animeId.toString(),
      episodeNumber: episode.episodeNumber.toString()
    } : {
      title: "",
      animeId: "",
      episodeNumber: "1",
      description: "",
      thumbnail: ""
    }
  });

  const episodeMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (isEditing) {
        const res = await apiRequest("PUT", `/api/admin/episodes/${episode.id}`, values);
        return await res.json();
      } else {
        const res = await apiRequest("POST", "/api/admin/episodes", values);
        return await res.json();
      }
    },
    onSuccess: async (data) => {
      // After episode is created/updated, handle video sources
      try {
        for (const source of videoSources) {
          if (!source.videoUrl) continue;
          
          const sourceData = {
            ...source,
            episodeId: data.id,
            quality: "HD"
          };
          
          await apiRequest("POST", "/api/admin/sources", sourceData);
        }
        
        queryClient.invalidateQueries({ queryKey: ['/api/episodes'] });
        queryClient.invalidateQueries({ queryKey: [`/api/episodes/${data.id}/sources`] });
        
        toast({
          title: `Episode ${isEditing ? 'updated' : 'created'} successfully`,
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
        title: `Failed to ${isEditing ? 'update' : 'create'} episode`,
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (values: FormValues) => {
    episodeMutation.mutate(values);
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

  const isLoading = isLoadingAnime || isLoadingSources || episodeMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="animeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anime Series</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={isLoadingAnime}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select anime series" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {animeSeries && animeSeries.map(anime => (
                      <SelectItem key={anime.id} value={anime.id.toString()}>
                        {anime.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="episodeNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Episode Number</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="e.g. 1" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Episode Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter episode title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="thumbnail"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Thumbnail URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter thumbnail URL" 
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
                    placeholder="Enter episode description" 
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
            {isEditing ? 'Update' : 'Create'} Episode
          </Button>
        </div>
      </form>
    </Form>
  );
}
