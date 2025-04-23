import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertAnimeSeriesSchema, 
  insertMovieSchema, 
  insertEpisodeSchema, 
  insertVideoSourceSchema,
  insertServerSchema,
  users
} from "@shared/schema";
import { db } from "./db";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Health check route
  app.get("/api/health", (_, res) => {
    res.status(200).json({ status: "ok" });
  });
  
  // ===== User Management Routes =====
  app.get("/api/admin/users", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !(req.user as Express.User).isAdmin) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const allUsers = await db.select().from(users);
      res.status(200).json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // ===== Anime Routes =====
  app.get("/api/anime", async (req, res) => {
    try {
      const query = req.query.search as string | undefined;
      let anime;
      
      if (query) {
        anime = await storage.searchAnimeSeries(query);
      } else {
        anime = await storage.getAllAnimeSeries();
      }
      
      res.json(anime);
    } catch (error) {
      console.error("Error fetching anime:", error);
      res.status(500).json({ message: "Failed to fetch anime" });
    }
  });

  app.get("/api/anime/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const anime = await storage.getAnimeSeries(id);
      
      if (!anime) {
        return res.status(404).json({ message: "Anime not found" });
      }
      
      res.json(anime);
    } catch (error) {
      console.error("Error fetching anime:", error);
      res.status(500).json({ message: "Failed to fetch anime" });
    }
  });
  
  app.get("/api/anime/:id/episodes", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const anime = await storage.getAnimeSeries(id);
      
      if (!anime) {
        return res.status(404).json({ message: "Anime not found" });
      }
      
      const episodes = await storage.getEpisodesByAnimeId(id);
      res.json(episodes);
    } catch (error) {
      console.error("Error fetching episodes:", error);
      res.status(500).json({ message: "Failed to fetch episodes" });
    }
  });

  // Admin anime routes
  app.post("/api/admin/anime", async (req, res) => {
    try {
      const validatedData = insertAnimeSeriesSchema.parse(req.body);
      const newAnime = await storage.createAnimeSeries(validatedData);
      res.status(201).json(newAnime);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating anime:", error);
      res.status(500).json({ message: "Failed to create anime" });
    }
  });

  app.put("/api/admin/anime/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAnimeSeriesSchema.partial().parse(req.body);
      
      const updatedAnime = await storage.updateAnimeSeries(id, validatedData);
      
      if (!updatedAnime) {
        return res.status(404).json({ message: "Anime not found" });
      }
      
      res.json(updatedAnime);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating anime:", error);
      res.status(500).json({ message: "Failed to update anime" });
    }
  });

  app.delete("/api/admin/anime/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAnimeSeries(id);
      
      if (!success) {
        return res.status(404).json({ message: "Anime not found" });
      }
      
      res.json({ message: "Anime deleted successfully" });
    } catch (error) {
      console.error("Error deleting anime:", error);
      res.status(500).json({ message: "Failed to delete anime" });
    }
  });

  // ===== Movies Routes =====
  app.get("/api/movies", async (req, res) => {
    try {
      const query = req.query.search as string | undefined;
      let movies;
      
      if (query) {
        movies = await storage.searchMovies(query);
      } else {
        movies = await storage.getAllMovies();
      }
      
      res.json(movies);
    } catch (error) {
      console.error("Error fetching movies:", error);
      res.status(500).json({ message: "Failed to fetch movies" });
    }
  });

  app.get("/api/movies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const movie = await storage.getMovie(id);
      
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      
      res.json(movie);
    } catch (error) {
      console.error("Error fetching movie:", error);
      res.status(500).json({ message: "Failed to fetch movie" });
    }
  });

  // Admin movie routes
  app.post("/api/admin/movies", async (req, res) => {
    try {
      const validatedData = insertMovieSchema.parse(req.body);
      const newMovie = await storage.createMovie(validatedData);
      res.status(201).json(newMovie);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating movie:", error);
      res.status(500).json({ message: "Failed to create movie" });
    }
  });

  app.put("/api/admin/movies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertMovieSchema.partial().parse(req.body);
      
      const updatedMovie = await storage.updateMovie(id, validatedData);
      
      if (!updatedMovie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      
      res.json(updatedMovie);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating movie:", error);
      res.status(500).json({ message: "Failed to update movie" });
    }
  });

  app.delete("/api/admin/movies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMovie(id);
      
      if (!success) {
        return res.status(404).json({ message: "Movie not found" });
      }
      
      res.json({ message: "Movie deleted successfully" });
    } catch (error) {
      console.error("Error deleting movie:", error);
      res.status(500).json({ message: "Failed to delete movie" });
    }
  });

  // ===== Episodes Routes =====
  app.get("/api/episodes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const episode = await storage.getEpisode(id);
      
      if (!episode) {
        return res.status(404).json({ message: "Episode not found" });
      }
      
      res.json(episode);
    } catch (error) {
      console.error("Error fetching episode:", error);
      res.status(500).json({ message: "Failed to fetch episode" });
    }
  });

  app.get("/api/episodes/:id/sources", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sources = await storage.getVideoSourcesByEpisodeId(id);
      res.json(sources);
    } catch (error) {
      console.error("Error fetching video sources:", error);
      res.status(500).json({ message: "Failed to fetch video sources" });
    }
  });

  // Admin episode routes
  app.post("/api/admin/episodes", async (req, res) => {
    try {
      const validatedData = insertEpisodeSchema.parse(req.body);
      const newEpisode = await storage.createEpisode(validatedData);
      res.status(201).json(newEpisode);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating episode:", error);
      res.status(500).json({ message: "Failed to create episode" });
    }
  });

  app.put("/api/admin/episodes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEpisodeSchema.partial().parse(req.body);
      
      const updatedEpisode = await storage.updateEpisode(id, validatedData);
      
      if (!updatedEpisode) {
        return res.status(404).json({ message: "Episode not found" });
      }
      
      res.json(updatedEpisode);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating episode:", error);
      res.status(500).json({ message: "Failed to update episode" });
    }
  });

  app.delete("/api/admin/episodes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEpisode(id);
      
      if (!success) {
        return res.status(404).json({ message: "Episode not found" });
      }
      
      res.json({ message: "Episode deleted successfully" });
    } catch (error) {
      console.error("Error deleting episode:", error);
      res.status(500).json({ message: "Failed to delete episode" });
    }
  });

  // ===== Video Sources Routes =====
  app.get("/api/movies/:id/sources", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sources = await storage.getVideoSourcesByMovieId(id);
      res.json(sources);
    } catch (error) {
      console.error("Error fetching video sources:", error);
      res.status(500).json({ message: "Failed to fetch video sources" });
    }
  });

  // Admin video source routes
  app.post("/api/admin/sources", async (req, res) => {
    try {
      const validatedData = insertVideoSourceSchema.parse(req.body);
      const newSource = await storage.createVideoSource(validatedData);
      res.status(201).json(newSource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating video source:", error);
      res.status(500).json({ message: "Failed to create video source" });
    }
  });

  app.put("/api/admin/sources/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertVideoSourceSchema.partial().parse(req.body);
      
      const updatedSource = await storage.updateVideoSource(id, validatedData);
      
      if (!updatedSource) {
        return res.status(404).json({ message: "Video source not found" });
      }
      
      res.json(updatedSource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating video source:", error);
      res.status(500).json({ message: "Failed to update video source" });
    }
  });

  app.delete("/api/admin/sources/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteVideoSource(id);
      
      if (!success) {
        return res.status(404).json({ message: "Video source not found" });
      }
      
      res.json({ message: "Video source deleted successfully" });
    } catch (error) {
      console.error("Error deleting video source:", error);
      res.status(500).json({ message: "Failed to delete video source" });
    }
  });

  // ===== Server Routes =====
  app.get("/api/servers", async (req, res) => {
    try {
      const servers = await storage.getAllServers();
      res.json(servers);
    } catch (error) {
      console.error("Error fetching servers:", error);
      res.status(500).json({ message: "Failed to fetch servers" });
    }
  });

  // Admin server routes
  app.post("/api/admin/servers", async (req, res) => {
    try {
      const validatedData = insertServerSchema.parse(req.body);
      const newServer = await storage.createServer(validatedData);
      res.status(201).json(newServer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating server:", error);
      res.status(500).json({ message: "Failed to create server" });
    }
  });

  app.put("/api/admin/servers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertServerSchema.partial().parse(req.body);
      
      const updatedServer = await storage.updateServer(id, validatedData);
      
      if (!updatedServer) {
        return res.status(404).json({ message: "Server not found" });
      }
      
      res.json(updatedServer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating server:", error);
      res.status(500).json({ message: "Failed to update server" });
    }
  });

  app.delete("/api/admin/servers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteServer(id);
      
      if (!success) {
        return res.status(404).json({ message: "Server not found" });
      }
      
      res.json({ message: "Server deleted successfully" });
    } catch (error) {
      console.error("Error deleting server:", error);
      res.status(500).json({ message: "Failed to delete server" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
