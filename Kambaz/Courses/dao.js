import model from "./model.js";

export const findAllCourses = async () => {
  try {
    return await model.find().populate("modules").exec();
  } catch (error) {
    console.error("Error finding all courses:", error);
    throw new Error("Failed to fetch courses");
  }
};

export const findCourseById = async (courseId) => {
  try {
    return await model.findById(courseId).populate("modules").exec();
  } catch (error) {
    console.error(`Error finding course ${courseId}:`, error);
    throw new Error("Course not found");
  }
};

export const findCoursesForEnrolledUser = async (userId) => {
  try {
    return await model.aggregate([
      {
        $lookup: {
          from: "enrollments",
          let: { courseId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user", userId] },
                    { $eq: ["$course", "$$courseId"] },
                  ],
                },
              },
            },
          ],
          as: "enrollment",
        },
      },
      {
        $match: {
          enrollment: { $ne: [] },
        },
      },
      {
        $addFields: {
          enrolled: true,
        },
      },
    ]);
  } catch (error) {
    console.error(`Error finding courses for user ${userId}:`, error);
    throw new Error("Failed to fetch enrolled courses");
  }
};

export const createCourse = async (course) => {
  try {
    // Remove _id if present to let MongoDB generate it
    const { _id, ...courseData } = course;
    return await model.create(courseData);
  } catch (error) {
    console.error("Error creating course:", error);
    throw new Error("Failed to create course");
  }
};

export const deleteCourse = async (courseId) => {
  try {
    return await model.deleteOne({ _id: courseId });
  } catch (error) {
    console.error(`Error deleting course ${courseId}:`, error);
    throw new Error("Failed to delete course");
  }
};

export const updateCourse = async (courseId, courseUpdates) => {
  try {
    return await model.updateOne(
      { _id: courseId },
      { $set: courseUpdates },
      { new: true }
    );
  } catch (error) {
    console.error(`Error updating course ${courseId}:`, error);
    throw new Error("Failed to update course");
  }
};
