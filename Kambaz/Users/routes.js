import * as dao from "./dao.js";
import * as courseDao from "../Courses/dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";

export default function UserRoutes(app) {
  const createCourse = async (req, res) => {
    try {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      const newCourse = await courseDao.createCourse({
        ...req.body,
        author: currentUser._id,
      });
      await enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id);
      res.json(newCourse);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };

  const createUser = async (req, res) => {
    try {
      const user = await dao.createUser(req.body);
      res.json(user);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };

  const deleteUser = async (req, res) => {
    try {
      const status = await dao.deleteUser(req.params.userId);
      res.json(status);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  const findAllUsers = async (req, res) => {
    const { role, name } = req.query;
    if (role) {
      const users = await dao.findUsersByRole(role);
      res.json(users);
      return;
    }
    if (name) {
      const users = await dao.findUsersByPartialName(name);
      res.json(users);
      return;
    }

    const users = await dao.findAllUsers();
    res.json(users);
  };

  const findUserById = async (req, res) => {
    try {
      const user = await dao.findUserById(req.params.userId);
      res.json(user);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };

  const updateUser = async (req, res) => {
    const { userId } = req.params;
    const userUpdates = req.body;
    await dao.updateUser(userId, userUpdates);
    const currentUser = req.session["currentUser"];
    if (currentUser && currentUser._id === userId) {
      req.session["currentUser"] = { ...currentUser, ...userUpdates };
    }
    res.json(currentUser);
  };

  const signup = async (req, res) => {
    try {
      // 1. Validate required fields
      if (!req.body._id || !req.body.username || !req.body.password) {
        return res.status(400).json({
          message: "_id, username, and password are required",
        });
      }

      // 2. Check for existing user or ID
      const [existingUser, idExists] = await Promise.all([
        dao.findUserByUsername(req.body.username),
        dao.findUserById(req.body._id), // Add this method to your DAO
      ]);

      if (existingUser) {
        return res.status(400).json({ message: "Username already in use" });
      }
      if (idExists) {
        return res.status(400).json({ message: "User ID already exists" });
      }

      // 3. Prepare user data with defaults
      const userData = {
        _id: req.body._id, // Your manual ID
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName || null,
        lastName: req.body.lastName || null,
        email: req.body.email || null,
        role: req.body.role || "USER",
        loginId: req.body.loginId || generateDefaultLoginId(), // Custom function
        section: req.body.section || "default",
        lastActivity: req.body.lastActivity || new Date(),
        totalActivity: req.body.totalActivity || "0",
      };

      // 4. Create user
      const currentUser = await dao.createUser(userData);

      // 5. Set session and respond
      req.session["currentUser"] = currentUser;
      res.status(201).json({
        _id: currentUser._id,
        username: currentUser.username,
        role: currentUser.role,
        loginId: currentUser.loginId,
        section: currentUser.section,
        // Include other fields you want to return
      });
    } catch (err) {
      console.error("Signup error:", err);

      // Handle duplicate key errors
      if (err.code === 11000) {
        const field = err.keyPattern.username ? "username" : "_id";
        return res.status(400).json({
          message: `${field} already exists`,
        });
      }

      res.status(400).json({
        message: err.message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      });
    }
  };

  // Helper function (add this to your utilities)
  function generateDefaultLoginId() {
    return `user_${Math.random().toString(36).substring(2, 9)}`;
  }

  const signin = async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log("Login attempt for:", username); // Add logging

      const currentUser = await dao.findUserByCredentials(username, password);

      if (currentUser) {
        console.log("Login successful for:", username);
        req.session["currentUser"] = currentUser;

        // Ensure session is saved before responding
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({ message: "Session error" });
          }
          res.json(currentUser);
        });
      } else {
        console.log("Invalid credentials for:", username);
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (err) {
      console.error("Signin error:", err);
      res.status(400).json({ message: err.message });
    }
  };

  const signout = (req, res) => {
    req.session.destroy();
    res.sendStatus(200);
  };

  const profile = async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    try {
      const user = await dao.findUserById(currentUser._id);
      res.json(user);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };

  const findCoursesForEnrolledUser = async (req, res) => {
    try {
      let { userId } = req.params;
      if (userId === "current") {
        const currentUser = req.session["currentUser"];
        if (!currentUser) {
          res.sendStatus(401);
          return;
        }
        userId = currentUser._id;
      }
      const courses = await courseDao.findCoursesForEnrolledUser(userId);
      res.json(courses);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };

  // Route definitions
  app.post("/api/users/current/courses", createCourse);
  app.post("/api/users", createUser);
  app.get("/api/users", findAllUsers);
  app.get("/api/users/:userId", findUserById);
  app.put("/api/users/:userId", updateUser);
  app.delete("/api/users/:userId", deleteUser);
  app.post("/api/users/signup", signup);
  app.post("/api/users/signin", signin);
  app.post("/api/users/signout", signout);
  app.get("/api/users/profile", profile); // Changed from POST to GET
  app.get("/api/users/:userId/courses", findCoursesForEnrolledUser);
}
