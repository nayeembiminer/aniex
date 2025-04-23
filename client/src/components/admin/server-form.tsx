import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertServerSchema, Server } from "@shared/schema";
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
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

// Extend the schema with validation
const formSchema = insertServerSchema.extend({
  name: z.string().min(1, "Server name is required"),
  number: z.string().transform((val) => parseInt(val)),
  region: z.string().optional(),
  storageUsed: z.string().transform((val) => (val ? parseInt(val) : 0)),
  totalStorage: z.string().transform((val) => (val ? parseInt(val) : 100)),
});

type FormValues = z.infer<typeof formSchema>;

interface ServerFormProps {
  server?: Server;
  onSuccess?: () => void;
}

export function ServerForm({ server, onSuccess }: ServerFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const isEditing = !!server;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: server ? {
      ...server,
      number: server.number.toString(),
      storageUsed: server.storageUsed?.toString() || "0",
      totalStorage: server.totalStorage?.toString() || "100"
    } : {
      name: "",
      number: "",
      region: "",
      status: "online",
      storageUsed: "0",
      totalStorage: "100"
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (isEditing) {
        const res = await apiRequest("PUT", `/api/admin/servers/${server.id}`, values);
        return await res.json();
      } else {
        const res = await apiRequest("POST", "/api/admin/servers", values);
        return await res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/servers'] });
      toast({
        title: `Server ${isEditing ? 'updated' : 'created'} successfully`,
        description: `${form.getValues().name} has been ${isEditing ? 'updated' : 'added'} to the database.`,
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: `Failed to ${isEditing ? 'update' : 'create'} server`,
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Server Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter server name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Server Number</FormLabel>
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
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Region</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. US East, Europe, Asia" 
                    {...field}
                  />
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
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="storageUsed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Storage Used</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="e.g. 50" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="totalStorage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Storage</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="e.g. 100" 
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
            {isEditing ? 'Update' : 'Create'} Server
          </Button>
        </div>
      </form>
    </Form>
  );
}
