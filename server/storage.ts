import { 
  users, type User, type InsertUser,
  animeSeries, type AnimeSeries, type InsertAnimeSeries,
  movies, type Movie, type InsertMovie,
  episodes, type Episode, type InsertEpisode,
  videoSources, type VideoSource, type InsertVideoSource,
  servers, type Server, type InsertServer
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

// Interface for all storage operations
import { Store } from 'express-session';

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Anime series operations
  getAllAnimeSeries(): Promise<AnimeSeries[]>;
  getAnimeSeries(id: number): Promise<AnimeSeries | undefined>;
  createAnimeSeries(anime: InsertAnimeSeries): Promise<AnimeSeries>;
  updateAnimeSeries(id: number, anime: Partial<InsertAnimeSeries>): Promise<AnimeSeries | undefined>;
  deleteAnimeSeries(id: number): Promise<boolean>;
  searchAnimeSeries(query: string): Promise<AnimeSeries[]>;
  
  // Movie operations
  getAllMovies(): Promise<Movie[]>;
  getMovie(id: number): Promise<Movie | undefined>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  updateMovie(id: number, movie: Partial<InsertMovie>): Promise<Movie | undefined>;
  deleteMovie(id: number): Promise<boolean>;
  searchMovies(query: string): Promise<Movie[]>;
  
  // Episode operations
  getAllEpisodes(): Promise<Episode[]>;
  getEpisodesByAnimeId(animeId: number): Promise<Episode[]>;
  getEpisode(id: number): Promise<Episode | undefined>;
  createEpisode(episode: InsertEpisode): Promise<Episode>;
  updateEpisode(id: number, episode: Partial<InsertEpisode>): Promise<Episode | undefined>;
  deleteEpisode(id: number): Promise<boolean>;
  
  // Video source operations
  getVideoSourcesByEpisodeId(episodeId: number): Promise<VideoSource[]>;
  getVideoSourcesByMovieId(movieId: number): Promise<VideoSource[]>;
  createVideoSource(source: InsertVideoSource): Promise<VideoSource>;
  updateVideoSource(id: number, source: Partial<InsertVideoSource>): Promise<VideoSource | undefined>;
  deleteVideoSource(id: number): Promise<boolean>;
  
  // Server operations
  getAllServers(): Promise<Server[]>;
  getServer(id: number): Promise<Server | undefined>;
  createServer(server: InsertServer): Promise<Server>;
  updateServer(id: number, server: Partial<InsertServer>): Promise<Server | undefined>;
  deleteServer(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private animeSeries: Map<number, AnimeSeries>;
  private movies: Map<number, Movie>;
  private episodes: Map<number, Episode>;
  private videoSources: Map<number, VideoSource>;
  private servers: Map<number, Server>;
  
  sessionStore: session.SessionStore;
  
  private userId = 1;
  private animeSeriesId = 1;
  private movieId = 1;
  private episodeId = 1;
  private videoSourceId = 1;
  private serverId = 1;

  constructor() {
    this.users = new Map();
    this.animeSeries = new Map();
    this.movies = new Map();
    this.episodes = new Map();
    this.videoSources = new Map();
    this.servers = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Create admin user
    this.createUser({
      username: "admin999",
      password: "NAyeemafroza123!" // In production this would be hashed
    }).then((user) => {
      // Update user to have admin privileges
      const adminUser = { ...user, isAdmin: true };
      this.users.set(user.id, adminUser);
    });
    
    // Initialize with some sample servers
    this.initializeDefaultServers();
  }
  
  private initializeDefaultServers() {
    [
      { name: "Main Server", number: 1, region: "US East", status: "online", storageUsed: 92, totalStorage: 100 },
      { name: "Backup Server", number: 2, region: "EU Central", status: "online", storageUsed: 85, totalStorage: 100 },
      { name: "CDN Server", number: 3, region: "Asia Pacific", status: "maintenance", storageUsed: 68, totalStorage: 100 },
      { name: "Stream Server", number: 4, region: "US West", status: "online", storageUsed: 55, totalStorage: 100 },
      { name: "Mirror Server", number: 5, region: "South America", status: "online", storageUsed: 42, totalStorage: 100 },
      { name: "Backup Mirror", number: 6, region: "Australia", status: "offline", storageUsed: 30, totalStorage: 100 },
      { name: "Archive Server", number: 7, region: "Africa", status: "online", storageUsed: 78, totalStorage: 100 }
    ].forEach(server => this.createServer(server));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id, isAdmin: false };
    this.users.set(id, user);
    return user;
  }

  // Anime series methods
  async getAllAnimeSeries(): Promise<AnimeSeries[]> {
    return Array.from(this.animeSeries.values());
  }

  async getAnimeSeries(id: number): Promise<AnimeSeries | undefined> {
    return this.animeSeries.get(id);
  }

  async createAnimeSeries(anime: InsertAnimeSeries): Promise<AnimeSeries> {
    const id = this.animeSeriesId++;
    const createdAt = new Date();
    const newAnimeSeries: AnimeSeries = { ...anime, id, createdAt };
    this.animeSeries.set(id, newAnimeSeries);
    return newAnimeSeries;
  }

  async updateAnimeSeries(id: number, anime: Partial<InsertAnimeSeries>): Promise<AnimeSeries | undefined> {
    const existingAnime = this.animeSeries.get(id);
    if (!existingAnime) return undefined;
    
    const updatedAnime = { ...existingAnime, ...anime };
    this.animeSeries.set(id, updatedAnime);
    return updatedAnime;
  }

  async deleteAnimeSeries(id: number): Promise<boolean> {
    return this.animeSeries.delete(id);
  }

  async searchAnimeSeries(query: string): Promise<AnimeSeries[]> {
    if (!query) return this.getAllAnimeSeries();
    
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.animeSeries.values()).filter(anime => 
      anime.title.toLowerCase().includes(lowercaseQuery) || 
      anime.description.toLowerCase().includes(lowercaseQuery) ||
      (anime.genres && anime.genres.some(genre => genre.toLowerCase().includes(lowercaseQuery)))
    );
  }

  // Movie methods
  async getAllMovies(): Promise<Movie[]> {
    return Array.from(this.movies.values());
  }

  async getMovie(id: number): Promise<Movie | undefined> {
    return this.movies.get(id);
  }

  async createMovie(movie: InsertMovie): Promise<Movie> {
    const id = this.movieId++;
    const createdAt = new Date();
    const newMovie: Movie = { ...movie, id, createdAt };
    this.movies.set(id, newMovie);
    return newMovie;
  }

  async updateMovie(id: number, movie: Partial<InsertMovie>): Promise<Movie | undefined> {
    const existingMovie = this.movies.get(id);
    if (!existingMovie) return undefined;
    
    const updatedMovie = { ...existingMovie, ...movie };
    this.movies.set(id, updatedMovie);
    return updatedMovie;
  }

  async deleteMovie(id: number): Promise<boolean> {
    return this.movies.delete(id);
  }

  async searchMovies(query: string): Promise<Movie[]> {
    if (!query) return this.getAllMovies();
    
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.movies.values()).filter(movie => 
      movie.title.toLowerCase().includes(lowercaseQuery) || 
      movie.description.toLowerCase().includes(lowercaseQuery) ||
      (movie.genres && movie.genres.some(genre => genre.toLowerCase().includes(lowercaseQuery)))
    );
  }

  // Episode methods
  async getAllEpisodes(): Promise<Episode[]> {
    return Array.from(this.episodes.values());
  }

  async getEpisodesByAnimeId(animeId: number): Promise<Episode[]> {
    return Array.from(this.episodes.values())
      .filter(episode => episode.animeId === animeId)
      .sort((a, b) => a.episodeNumber - b.episodeNumber);
  }

  async getEpisode(id: number): Promise<Episode | undefined> {
    return this.episodes.get(id);
  }

  async createEpisode(episode: InsertEpisode): Promise<Episode> {
    const id = this.episodeId++;
    const createdAt = new Date();
    const newEpisode: Episode = { ...episode, id, createdAt };
    this.episodes.set(id, newEpisode);
    return newEpisode;
  }

  async updateEpisode(id: number, episode: Partial<InsertEpisode>): Promise<Episode | undefined> {
    const existingEpisode = this.episodes.get(id);
    if (!existingEpisode) return undefined;
    
    const updatedEpisode = { ...existingEpisode, ...episode };
    this.episodes.set(id, updatedEpisode);
    return updatedEpisode;
  }

  async deleteEpisode(id: number): Promise<boolean> {
    return this.episodes.delete(id);
  }

  // Video source methods
  async getVideoSourcesByEpisodeId(episodeId: number): Promise<VideoSource[]> {
    return Array.from(this.videoSources.values())
      .filter(source => source.episodeId === episodeId)
      .sort((a, b) => a.serverNumber - b.serverNumber);
  }

  async getVideoSourcesByMovieId(movieId: number): Promise<VideoSource[]> {
    return Array.from(this.videoSources.values())
      .filter(source => source.movieId === movieId)
      .sort((a, b) => a.serverNumber - b.serverNumber);
  }

  async createVideoSource(source: InsertVideoSource): Promise<VideoSource> {
    const id = this.videoSourceId++;
    const newSource: VideoSource = { ...source, id };
    this.videoSources.set(id, newSource);
    return newSource;
  }

  async updateVideoSource(id: number, source: Partial<InsertVideoSource>): Promise<VideoSource | undefined> {
    const existingSource = this.videoSources.get(id);
    if (!existingSource) return undefined;
    
    const updatedSource = { ...existingSource, ...source };
    this.videoSources.set(id, updatedSource);
    return updatedSource;
  }

  async deleteVideoSource(id: number): Promise<boolean> {
    return this.videoSources.delete(id);
  }

  // Server methods
  async getAllServers(): Promise<Server[]> {
    return Array.from(this.servers.values())
      .sort((a, b) => a.number - b.number);
  }

  async getServer(id: number): Promise<Server | undefined> {
    return this.servers.get(id);
  }

  async createServer(server: InsertServer): Promise<Server> {
    const id = this.serverId++;
    const newServer: Server = { ...server, id };
    this.servers.set(id, newServer);
    return newServer;
  }

  async updateServer(id: number, server: Partial<InsertServer>): Promise<Server | undefined> {
    const existingServer = this.servers.get(id);
    if (!existingServer) return undefined;
    
    const updatedServer = { ...existingServer, ...server };
    this.servers.set(id, updatedServer);
    return updatedServer;
  }

  async deleteServer(id: number): Promise<boolean> {
    return this.servers.delete(id);
  }
}

// Create PostgreSQL database storage implementation
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, like, or, desc } from "drizzle-orm";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // Anime series operations
  async getAllAnimeSeries(): Promise<AnimeSeries[]> {
    return await db.select().from(animeSeries).orderBy(desc(animeSeries.createdAt));
  }

  async getAnimeSeries(id: number): Promise<AnimeSeries | undefined> {
    const [anime] = await db.select().from(animeSeries).where(eq(animeSeries.id, id));
    return anime;
  }

  async createAnimeSeries(anime: InsertAnimeSeries): Promise<AnimeSeries> {
    const [newAnime] = await db.insert(animeSeries).values(anime).returning();
    return newAnime;
  }

  async updateAnimeSeries(id: number, anime: Partial<InsertAnimeSeries>): Promise<AnimeSeries | undefined> {
    const [updatedAnime] = await db
      .update(animeSeries)
      .set(anime)
      .where(eq(animeSeries.id, id))
      .returning();
    return updatedAnime;
  }

  async deleteAnimeSeries(id: number): Promise<boolean> {
    const result = await db.delete(animeSeries).where(eq(animeSeries.id, id));
    return result.rowCount > 0;
  }

  async searchAnimeSeries(query: string): Promise<AnimeSeries[]> {
    return await db
      .select()
      .from(animeSeries)
      .where(
        or(
          like(animeSeries.title, `%${query}%`),
          like(animeSeries.description, `%${query}%`)
        )
      );
  }

  // Movie operations
  async getAllMovies(): Promise<Movie[]> {
    return await db.select().from(movies).orderBy(desc(movies.createdAt));
  }

  async getMovie(id: number): Promise<Movie | undefined> {
    const [movie] = await db.select().from(movies).where(eq(movies.id, id));
    return movie;
  }

  async createMovie(movie: InsertMovie): Promise<Movie> {
    const [newMovie] = await db.insert(movies).values(movie).returning();
    return newMovie;
  }

  async updateMovie(id: number, movie: Partial<InsertMovie>): Promise<Movie | undefined> {
    const [updatedMovie] = await db
      .update(movies)
      .set(movie)
      .where(eq(movies.id, id))
      .returning();
    return updatedMovie;
  }

  async deleteMovie(id: number): Promise<boolean> {
    const result = await db.delete(movies).where(eq(movies.id, id));
    return result.rowCount > 0;
  }

  async searchMovies(query: string): Promise<Movie[]> {
    return await db
      .select()
      .from(movies)
      .where(
        or(
          like(movies.title, `%${query}%`),
          like(movies.description, `%${query}%`)
        )
      );
  }

  // Episode operations
  async getAllEpisodes(): Promise<Episode[]> {
    return await db.select().from(episodes).orderBy(desc(episodes.createdAt));
  }

  async getEpisodesByAnimeId(animeId: number): Promise<Episode[]> {
    return await db
      .select()
      .from(episodes)
      .where(eq(episodes.animeId, animeId))
      .orderBy(episodes.episodeNumber);
  }

  async getEpisode(id: number): Promise<Episode | undefined> {
    const [episode] = await db.select().from(episodes).where(eq(episodes.id, id));
    return episode;
  }

  async createEpisode(episode: InsertEpisode): Promise<Episode> {
    const [newEpisode] = await db.insert(episodes).values(episode).returning();
    return newEpisode;
  }

  async updateEpisode(id: number, episode: Partial<InsertEpisode>): Promise<Episode | undefined> {
    const [updatedEpisode] = await db
      .update(episodes)
      .set(episode)
      .where(eq(episodes.id, id))
      .returning();
    return updatedEpisode;
  }

  async deleteEpisode(id: number): Promise<boolean> {
    const result = await db.delete(episodes).where(eq(episodes.id, id));
    return result.rowCount > 0;
  }

  // Video source operations
  async getVideoSourcesByEpisodeId(episodeId: number): Promise<VideoSource[]> {
    return await db
      .select()
      .from(videoSources)
      .where(eq(videoSources.episodeId, episodeId));
  }

  async getVideoSourcesByMovieId(movieId: number): Promise<VideoSource[]> {
    return await db
      .select()
      .from(videoSources)
      .where(eq(videoSources.movieId, movieId));
  }

  async createVideoSource(source: InsertVideoSource): Promise<VideoSource> {
    const [newSource] = await db.insert(videoSources).values(source).returning();
    return newSource;
  }

  async updateVideoSource(id: number, source: Partial<InsertVideoSource>): Promise<VideoSource | undefined> {
    const [updatedSource] = await db
      .update(videoSources)
      .set(source)
      .where(eq(videoSources.id, id))
      .returning();
    return updatedSource;
  }

  async deleteVideoSource(id: number): Promise<boolean> {
    const result = await db.delete(videoSources).where(eq(videoSources.id, id));
    return result.rowCount > 0;
  }

  // Server operations
  async getAllServers(): Promise<Server[]> {
    return await db.select().from(servers);
  }

  async getServer(id: number): Promise<Server | undefined> {
    const [server] = await db.select().from(servers).where(eq(servers.id, id));
    return server;
  }

  async createServer(server: InsertServer): Promise<Server> {
    const [newServer] = await db.insert(servers).values(server).returning();
    return newServer;
  }

  async updateServer(id: number, server: Partial<InsertServer>): Promise<Server | undefined> {
    const [updatedServer] = await db
      .update(servers)
      .set(server)
      .where(eq(servers.id, id))
      .returning();
    return updatedServer;
  }

  async deleteServer(id: number): Promise<boolean> {
    const result = await db.delete(servers).where(eq(servers.id, id));
    return result.rowCount > 0;
  }
}

// Use Database Storage instead of MemStorage
export const storage = new DatabaseStorage();
