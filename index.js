import express from "express";
import mongoose from "mongoose";
import Hello from "./Hello.js";
import "dotenv/config";
import Lab5 from "./Lab5/index.js";
import session from "express-session";
import cors from "cors";
import compression from "compression";
import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import ModuleRoutes from "./Kambaz/Modules/routes.js";

const app = express();

// ✅ Allowed origins
const allowedOrigins = [
  "https://kambazwebsite.netlify.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

// ✅ CORS configuration
app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(
          new Error(`CORS policy does not allow access from ${origin}`),
          false
        );
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Preflight request fix
app.options(
  "*",
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);

// ✅ Session config
const sessionOptions = {
  secret: process.env.SESSION_SECRET || "kambaz",
  resave: false,
  saveUninitialized: false,
};

if (process.env.NODE_ENV !== "development") {
  // ✅ Production settings (needed for Netlify)
  sessionOptions.proxy = true;
  sessionOptions.cookie = {
    sameSite: "none",
    secure: true,
  };
} else {
  sessionOptions.cookie = {
    secure: false,
    sameSite: "lax",
  };
}

app.use(session(sessionOptions));
app.use(express.json());
app.use(compression());

// ✅ Routes
UserRoutes(app);
CourseRoutes(app);
ModuleRoutes(app);
Hello(app);
Lab5(app);

// ✅ MongoDB connection
const CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING;

mongoose
  .connect(CONNECTION_STRING)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((error) => console.error("❌ MongoDB Connection Failed", error));

// ✅ Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
