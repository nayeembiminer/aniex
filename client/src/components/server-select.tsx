import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VideoSource } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface ServerSelectProps {
  episodeId?: number;
  movieId?: number;
  onServerSelect: (source: VideoSource) => void;
}

export function ServerSelect({ episodeId, movieId, onServerSelect }: ServerSelectProps) {
  const [selectedServer, setSelectedServer] = useState<string | undefined>();

  const { data: sources, isLoading } = useQuery<VideoSource[]>({
    queryKey: episodeId 
      ? [`/api/episodes/${episodeId}/sources`] 
      : [`/api/movies/${movieId}/sources`],
    enabled: !!(episodeId || movieId),
  });

  const handleServerChange = (value: string) => {
    setSelectedServer(value);
    const selectedSource = sources?.find(source => source.serverNumber.toString() === value);
    if (selectedSource) {
      onServerSelect(selectedSource);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm">Loading servers...</span>
      </div>
    );
  }

  if (!sources || sources.length === 0) {
    return <Badge variant="outline">No servers available</Badge>;
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm">Server:</span>
      <Select value={selectedServer} onValueChange={handleServerChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select server" />
        </SelectTrigger>
        <SelectContent>
          {sources.map((source) => (
            <SelectItem key={source.id} value={source.serverNumber.toString()}>
              Server {source.serverNumber} ({source.serverName})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
