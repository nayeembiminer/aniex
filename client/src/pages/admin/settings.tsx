import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  // General settings
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [autoPublish, setAutoPublish] = useState(localStorage.getItem("autoPublish") === "true");
  const [defaultServerLabel, setDefaultServerLabel] = useState(
    localStorage.getItem("defaultServerLabel") || "Source"
  );
  
  // Cache settings
  const [enableCache, setEnableCache] = useState(localStorage.getItem("enableCache") === "true" || true);
  const [cacheDuration, setCacheDuration] = useState(
    localStorage.getItem("cacheDuration") || "30"
  );
  
  // Save settings
  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulate network request
    setTimeout(() => {
      // Save to localStorage
      localStorage.setItem("darkMode", darkMode.toString());
      localStorage.setItem("autoPublish", autoPublish.toString());
      localStorage.setItem("defaultServerLabel", defaultServerLabel);
      localStorage.setItem("enableCache", enableCache.toString());
      localStorage.setItem("cacheDuration", cacheDuration);
      
      setIsSaving(false);
      
      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully."
      });
    }, 800);
  };
  
  // Clear cache
  const handleClearCache = () => {
    // Simulate clearing cache
    setTimeout(() => {
      toast({
        title: "Cache cleared",
        description: "Application cache has been cleared successfully."
      });
    }, 600);
  };
  
  return (
    <AdminLayout title="Settings">
      <div className="space-y-6">
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="cache">Cache</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Manage the application's general settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable dark mode for the admin panel
                    </p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-publish">Auto-Publish Content</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically publish new content when added
                    </p>
                  </div>
                  <Switch
                    id="auto-publish"
                    checked={autoPublish}
                    onCheckedChange={setAutoPublish}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="default-server">Default Server Label</Label>
                  <Input
                    id="default-server"
                    value={defaultServerLabel}
                    onChange={(e) => setDefaultServerLabel(e.target.value)}
                    placeholder="e.g. Source, Default, Main"
                  />
                  <p className="text-sm text-muted-foreground">
                    Label for the default streaming server
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="cache">
            <Card>
              <CardHeader>
                <CardTitle>Cache Settings</CardTitle>
                <CardDescription>Manage the application's cache settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable-cache">Enable Caching</Label>
                    <p className="text-sm text-muted-foreground">
                      Cache API responses to improve performance
                    </p>
                  </div>
                  <Switch
                    id="enable-cache"
                    checked={enableCache}
                    onCheckedChange={setEnableCache}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cache-duration">Cache Duration (minutes)</Label>
                  <Input
                    id="cache-duration"
                    type="number"
                    value={cacheDuration}
                    onChange={(e) => setCacheDuration(e.target.value)}
                    min="1"
                    max="1440"
                  />
                  <p className="text-sm text-muted-foreground">
                    How long to keep cached data before refreshing
                  </p>
                </div>
                
                <Button variant="outline" onClick={handleClearCache}>
                  Clear Cache
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>Manage advanced application settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  These settings are for advanced users. Changing these settings may affect the application's performance.
                </p>
                
                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md p-4 mb-4">
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    No advanced settings are currently available. These will be added in a future update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}