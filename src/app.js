const express = require("express");

const app = express();
app.use(express.json());

app.get("/users", (request, response) => {
  console.log(request.body);
  const users = [
    {
      name: "Cauan",
      age: 22,
    },
    {
      name: "Maykel",
      age: 25,
    },
  ];
  return response.json(users);
});

app.listen(3000, () => {
  console.log("Server running in port 3000");
});
