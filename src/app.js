import express from "express";
import users from "./database";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(express.json());

const createUserService = (userData) => {
  const user = {
    uuid: uuidv4(),
    ...userData,
    createdAt: new Date(),
  };
  users.push(user);
  return [201, user];
};

const listUserService = (module) => {
  if (module) {
    const filterUsers = users.filter((el) => el.module === module);
    return filterUsers;
  }
  return users;
};

const retrieveUserService = (id) => {
  const user = users.find((el) => el.uuid === id);
  if (!user) {
    return [404, { message: "User not found!" }];
  }
  return [200, user];
};

const deleteUserService = (id) => {
  const user = users.find((el) => el.uuid === id);
  if (!user) {
    return [404, { message: "User not found!" }];
  }
  const index = users.findIndex((el) => el.uuid === id);
  users.splice(index, 1);
  return [204, {}];
};

const createUserController = (request, response) => {
  const [status, data] = createUserService(request.body);
  return response.status(status).json(data);
};

const listUserController = (request, response) => {
  const usersData = listUserService(request.query.module);
  return response.json(usersData);
};

const retrieveUserController = (request, response) => {
  const [status, data] = retrieveUserService(request.params.id);
  return response.status(status).json(data);
};

const deleteUserController = (request, response) => {
  const [status, data] = deleteUserService(request.params.id);
  return response.status(status).json(data);
};

app.post("/users", createUserController);
app.get("/users", listUserController);
app.get("/users/:id", retrieveUserController);
app.delete("/users/:id", deleteUserController);

app.listen(3000, () => {
  console.log("Server running in port 3000");
});
