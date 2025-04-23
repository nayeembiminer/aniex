import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

// Anime Series schema
export const animeSeries = pgTable("anime_series", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  coverImage: text("cover_image"),
  bannerImage: text("banner_image"),
  genres: text("genres").array(),
  status: text("status").notNull().default("ongoing"),
  year: integer("year"),
  rating: text("rating"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAnimeSeriesSchema = createInsertSchema(animeSeries).omit({
  id: true,
  createdAt: true,
});

// Movies schema
export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  coverImage: text("cover_image"),
  bannerImage: text("banner_image"),
  genres: text("genres").array(),
  duration: integer("duration"), // Duration in minutes
  year: integer("year"),
  rating: text("rating"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMovieSchema = createInsertSchema(movies).omit({
  id: true,
  createdAt: true,
});

// Episodes schema
export const episodes = pgTable("episodes", {
  id: serial("id").primaryKey(),
  animeId: integer("anime_id").notNull(),
  title: text("title").notNull(),
  episodeNumber: integer("episode_number").notNull(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEpisodeSchema = createInsertSchema(episodes).omit({
  id: true,
  createdAt: true,
});

// Video sources schema
export const videoSources = pgTable("video_sources", {
  id: serial("id").primaryKey(),
  episodeId: integer("episode_id"),
  movieId: integer("movie_id"),
  serverName: text("server_name").notNull(),
  serverNumber: integer("server_number").notNull(),
  videoUrl: text("video_url").notNull(),
  quality: text("quality"),
});

export const insertVideoSourceSchema = createInsertSchema(videoSources).omit({
  id: true,
});

// Servers schema
export const servers = pgTable("servers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  number: integer("number").notNull(),
  region: text("region"),
  status: text("status").notNull().default("online"),
  storageUsed: integer("storage_used").default(0),
  totalStorage: integer("total_storage").default(100),
});

export const insertServerSchema = createInsertSchema(servers).omit({
  id: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type AnimeSeries = typeof animeSeries.$inferSelect;
export type InsertAnimeSeries = z.infer<typeof insertAnimeSeriesSchema>;

export type Movie = typeof movies.$inferSelect;
export type InsertMovie = z.infer<typeof insertMovieSchema>;

export type Episode = typeof episodes.$inferSelect;
export type InsertEpisode = z.infer<typeof insertEpisodeSchema>;

export type VideoSource = typeof videoSources.$inferSelect;
export type InsertVideoSource = z.infer<typeof insertVideoSourceSchema>;

export type Server = typeof servers.$inferSelect;
export type InsertServer = z.infer<typeof insertServerSchema>;
