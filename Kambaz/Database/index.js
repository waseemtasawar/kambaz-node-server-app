import courses from "./courses.json" with { type: "json" };
import modules from "./modules.json" with { type: "json" };
import assignments from "./assignments.json" with { type: "json" };
import enrollments from "./enrollments.json" with { type: "json" };
import users from "./users.json" with { type: "json" };

const db = { courses, modules, assignments, enrollments, users };
export default db;  // ES Modules default export