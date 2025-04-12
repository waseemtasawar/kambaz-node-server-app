import express from "express";
import mongoose from "mongoose";
import Hello from "./Hello.js";
import "dotenv/config";
import Lab5 from "./Lab5/index.js";
import session from "express-session";
import cors from "cors";
import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import ModuleRoutes from "./Kambaz/Modules/routes.js";
import compression from "compression";

const app = express();

// Enhanced CORS configuration
const allowedOrigins = [
  process.env.NETLIFY_URL || "https://kambazwebsite.netlify.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Session configuration
const sessionOptions = {
  secret: process.env.SESSION_SECRET || "kambaz",
  resave: false,
  saveUninitialized: false,
};

if (process.env.NODE_ENV !== "development") {
  sessionOptions.proxy = true;
  sessionOptions.cookie = {
    sameSite: "none",
    secure: true,
    domain: process.env.NODE_SERVER_DOMAIN,
  };
} else {
  // Development-specific cookie settings
  sessionOptions.cookie = {
    secure: false,
    sameSite: "lax",
  };
}

app.use(session(sessionOptions));
app.use(express.json());
app.use(compression());

// Routes
UserRoutes(app);
CourseRoutes(app);
ModuleRoutes(app);

Hello(app);
Lab5(app);

// Database connection
const CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING;

mongoose
  .connect(CONNECTION_STRING)
  .then(() => {
    console.log("Database connected Successfully");
  })
  .catch((error) => {
    console.log("Database is not Connected", error);
  });

// Server startup
app.listen(process.env.PORT || 4000, () => {
  console.log(`Server running on http://localhost:${process.env.PORT || 4000}`);
});
