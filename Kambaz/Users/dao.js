import model from "./model.js";

export const createUser = async (userData) => {
  // Ensure _id exists - either from input or generate new
  if (!userData._id) {
    userData._id = new mongoose.Types.ObjectId().toString();
  }
  return await model.create(userData);
};
export const findAllUsers = () => model.find();
export const findUserById = (userId) => model.findById(userId);

export const findUserByUsername = (username) =>
  model.findOne({ username: username });

export const findUserByCredentials = (username, password) =>
  model.findOne({ username, password });
export const updateUser = (userId, user) =>
  model.updateOne({ _id: userId }, { $set: user });
export const findUsersByRole = (role) => model.find({ role: role });
export const deleteUser = (userId) => model.deleteOne({ _id: userId });
export const findUsersByPartialName = (partialName) => {
  const regex = new RegExp(partialName, "i"); // 'i' makes it case-insensitive
  return model.find({
    $or: [{ firstName: { $regex: regex } }, { lastName: { $regex: regex } }],
  });
};
