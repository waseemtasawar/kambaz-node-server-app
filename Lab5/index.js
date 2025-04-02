import PathParameters from "./PathParameters.js";
import QueryParameters from "./QueryParameters.js";
import WorkingWithObjects from "./WorkingWithObjects.js";
import WorkingWithArrays from "./WorkingWithArrays.js";

let module = {
  id: "CS1234",
  name: "Web Development",
  description: "Learn to build modern web applications",
  course: "Computer Science",
};

export default function Lab5(app) {
  app.get("/lab5/welcome", (req, res) => {
    res.send("Welcome to Lab 5");
  });
  PathParameters(app);
  QueryParameters(app);
  WorkingWithObjects(app);
  WorkingWithArrays(app);

  // New routes for module operations
  app.get("/lab5/module", (req, res) => {
    res.json(module);
  });

  app.get("/lab5/module/name", (req, res) => {
    res.json(module.name);
  });

  app.post("/lab5/module/name/:newName", (req, res) => {
    const { newName } = req.params;
    module.name = newName;
    res.json(module);
  });

  app.post("/lab5/module/description/:newDescription", (req, res) => {
    const { newDescription } = req.params;
    module.description = newDescription;
    res.json(module);
  });

  // Assignment routes
  let assignment = {
    id: "A101",
    title: "Lab 5",
    score: 95,
    completed: true,
  };

  app.put("/lab5/assignment/score/:newScore", (req, res) => {
    const { newScore } = req.params;
    assignment.score = parseInt(newScore);
    res.json(assignment);
  });

  app.put("/lab5/assignment/completed/:completed", (req, res) => {
    const { completed } = req.params;
    assignment.completed = completed === "true";
    res.json(assignment);
  });

  // Todo routes
  app.get("/lab5/todos", (req, res) => {
    res.json(todos);
  });

  app.put("/lab5/todos/:id/completed/:completed", (req, res) => {
    const { id, completed } = req.params;
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = completed === "true";
      res.json(todos);
    } else {
      res.status(404).send("Todo not found");
    }
  });

  app.put("/lab5/todos/:id/description/:description", (req, res) => {
    const { id, description } = req.params;
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      todo.description = description;
      res.json(todos);
    } else {
      res.status(404).send("Todo not found");
    }
  });
}
