import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User, InsertUser } from "@shared/schema";
import { z } from "zod";

// Define the user shape for Express session
type AppUser = {
  id: number;
  username: string;
  password: string;
  isAdmin: boolean;
};

declare global {
  namespace Express {
    // Declare the User interface
    interface User extends AppUser {}
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "anime-streaming-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days for longer persistence
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax' // Allows cookies to be sent in first-party context
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user || user.password !== password) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // User registration endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password } = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if this is the admin user
      const isAdmin = username === "admin999" && password === "NAyeemafroza123!";
      
      // Create the user with proper typing
      const userData: InsertUser = {
        username,
        password,
        isAdmin, 
      };
      
      const newUser = await storage.createUser(userData);
      
      // Log the user in after registration
      req.login(newUser, (err) => {
        if (err) return next(err);
        res.status(201).json(newUser);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    // Return the authenticated user
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });

  // Middleware to check if user is admin
  app.use("/api/admin/*", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = req.user as Express.User;
    if (!user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    next();
  });
}
