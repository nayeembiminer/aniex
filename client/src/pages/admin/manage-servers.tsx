import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { ServerForm } from "@/components/admin/server-form";
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
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Edit,
  Trash,
  MoreVertical,
  Settings,
  Server,
} from "lucide-react";
import { Server as ServerType } from "@shared/schema";

export default function ManageServers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<ServerType | null>(null);

  // Fetch servers
  const { data: serversData, isLoading } = useQuery<ServerType[]>({
    queryKey: ['/api/servers'],
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/servers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/servers'] });
      toast({
        title: "Server deleted",
        description: "The server has been deleted successfully.",
      });
      setIsDeleteModalOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete server: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Set document title
  useEffect(() => {
    document.title = "Server Management - AniEx Admin";
  }, []);

  // Handle editing a server
  const handleEdit = (server: ServerType) => {
    setSelectedServer(server);
    setIsEditModalOpen(true);
  };

  // Handle deleting a server
  const handleDelete = (server: ServerType) => {
    setSelectedServer(server);
    setIsDeleteModalOpen(true);
  };

  // Function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return "server-online";
      case "maintenance":
        return "server-maintenance";
      case "offline":
        return "server-offline";
      default:
        return "server-offline";
    }
  };

  // Function to get progress bar color
  const getProgressColor = (status: string, usage: number) => {
    if (status !== "online") return "";
    
    if (usage > 90) return "bg-red-500";
    if (usage > 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <AdminLayout title="Server Management">
      <div className="flex justify-between items-center mb-6">
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Server
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(7)].map((_, i) => (
            <Card key={i} className="bg-card">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-36" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : serversData && serversData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {serversData.map((server) => {
            const usagePercentage = Math.floor(
              (server.storageUsed / server.totalStorage) * 100
            );
            
            return (
              <Card key={server.id} className="bg-card overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 ${
                        server.status === 'online' ? 'bg-green-500' : 
                        server.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                      } rounded-full mr-2`}></div>
                      <h2 className="text-lg font-medium flex items-center">
                        <Server className="mr-2 h-5 w-5 text-muted-foreground" />
                        {server.name} (Server {server.number})
                      </h2>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(server)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(server)}>
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          Advanced Settings
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Storage Usage</span>
                      <span className="text-sm">{usagePercentage}%</span>
                    </div>
                    <Progress 
                      value={usagePercentage} 
                      className="h-2 bg-muted"
                      indicatorClassName={getProgressColor(server.status, usagePercentage)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Server Name</span>
                      <p>{server.name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Region</span>
                      <p>{server.region || "Not specified"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Storage</span>
                      <p>{server.storageUsed} / {server.totalStorage} GB</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status</span>
                      <p className={server.status === 'online' ? 'text-green-500' : 
                                  server.status === 'maintenance' ? 'text-yellow-500' : 'text-red-500'}>
                        {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Server className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Servers Found</h3>
          <p className="text-muted-foreground mb-6">
            You haven't added any servers yet. Add a server to manage video streaming sources.
          </p>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Server
          </Button>
        </div>
      )}

      {/* Add Server Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Server</DialogTitle>
            <DialogDescription>
              Configure a new streaming server for your content.
            </DialogDescription>
          </DialogHeader>
          <ServerForm onSuccess={() => setIsAddModalOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Server Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Server</DialogTitle>
            <DialogDescription>
              Update the configuration for this server.
            </DialogDescription>
          </DialogHeader>
          {selectedServer && (
            <ServerForm
              server={selectedServer}
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
              Are you sure you want to delete "{selectedServer?.name}"? This action cannot be undone and may affect content availability.
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
              onClick={() => selectedServer && deleteMutation.mutate(selectedServer.id)}
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
