import { useState, useEffect } from "react";
import { VideoSource } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServerSelect } from "./server-select";
import { Loader2 } from "lucide-react";

interface VideoPlayerProps {
  episodeId?: number;
  movieId?: number;
  title: string;
}

export function VideoPlayer({ episodeId, movieId, title }: VideoPlayerProps) {
  const [selectedSource, setSelectedSource] = useState<VideoSource | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleServerSelect = (source: VideoSource) => {
    setSelectedSource(source);
    setIsLoading(true);
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
          <ServerSelect 
            episodeId={episodeId} 
            movieId={movieId} 
            onServerSelect={handleServerSelect} 
          />
        </div>
      </CardHeader>
      <CardContent className="p-0 relative aspect-video bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {selectedSource ? (
          <iframe
            src={selectedSource.videoUrl}
            title={title}
            className="w-full h-full"
            allowFullScreen
            onLoad={handleVideoLoad}
          ></iframe>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            Please select a server to start watching
          </div>
        )}
      </CardContent>
    </Card>
  );
}
