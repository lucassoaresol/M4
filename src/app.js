import express from "express";
import users from "./database";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(express.json());

app.post("/users", (request, response) => {
  const user = {
    uuid: uuidv4(),
    ...request.body,
  };
  users.push(user);
  return response.status(201).json(user);
});

app.get("/users", (request, response) => {
  return response.json(users);
});

app.get("/users/:id", (request, response) => {
  const id = request.params.id;
  const user = users.find((el) => el.uuid === id);
  if (!user) {
    return response.status(404).json({ message: "User not found" });
  }
  return response.json(user);
});

app.listen(3000, () => {
  console.log("Server running in port 3000");
});
