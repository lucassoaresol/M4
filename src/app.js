import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { compare, hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import users from './database';
import 'dotenv/config';

const app = express();
app.use(express.json());

const ensureAuthMiddleware = (request, response, next) => {
  let { authorization } = request.headers;

  if (!authorization) {
    return response.status(401).json({
      message: 'Invalid token',
    });
  }

  authorization = authorization.split(' ')[1];

  return jwt.verify(authorization, process.env.SECRET_KEY, (error, decoded) => {
    if (error) {
      return [
        401,
        {
          message: 'Invalid token',
        },
      ];
    }
    request.user = {
      id: decoded.sub,
    };
    return next();
  });
};

const ensureUserExistsMiddleware = (request, response, next) => {
  const userIndex = users.findIndex((el) => el.uuid === request.params.id);
  if (userIndex === -1) {
    return response.status(404).json({ message: 'User not found!' });
  }
  request.user = {
    userIndex,
  };
  return next();
};

const createUserService = async (userData) => {
  const user = {
    uuid: uuidv4(),
    ...userData,
    password: await hash(userData.password, 10),
    createdAt: new Date(),
  };
  users.push(user);
  return [201, user];
};

const listUserService = (module) => {
  if (module) {
    const filterUsers = users.filter((el) => el.module === module);
    return [200, filterUsers];
  }
  return [200, users];
};

const retrieveUserService = (index) => [200, users[index]];

const deleteUserService = (index) => {
  users.splice(index, 1);
  return [204, {}];
};

const createSessionService = async ({ email, password }) => {
  const user = users.find((el) => el.email === email);
  if (!user) {
    return [
      401,
      {
        message: 'Wrong email or password',
      },
    ];
  }

  const passwordMatch = await compare(password, user.password);
  if (!passwordMatch) {
    return [
      401,
      {
        message: 'Wrong email or password',
      },
    ];
  }

  const token = jwt.sign(
    {
      age: user.age,
    },
    process.env.SECRET_KEY,
    {
      expiresIn: '24h',
      subject: user.uuid,
    }
  );

  return [200, { token }];
};

const createUserController = async (request, response) => {
  const [status, data] = await createUserService(request.body);
  return response.status(status).json(data);
};

const listUserController = (request, response) => {
  const [status, data] = listUserService(request.query.module);
  return response.status(status).json(data);
};

const retrieveUserController = (request, response) => {
  const [status, data] = retrieveUserService(request.user.userIndex);
  return response.status(status).json(data);
};

const deleteUserController = (request, response) => {
  const [status, data] = deleteUserService(request.user.userIndex);
  return response.status(status).json(data);
};

const createSessionController = async (request, response) => {
  const [status, data] = await createSessionService(request.body);
  return response.status(status).json(data);
};

app.post('/users', createUserController);
app.get('/users', ensureAuthMiddleware, listUserController);
app.get(
  '/users/:id',
  ensureAuthMiddleware,
  ensureUserExistsMiddleware,
  retrieveUserController
);
app.delete('/users/:id', ensureAuthMiddleware, deleteUserController);
app.post('/login', createSessionController);

app.listen(3000, () => {
  console.log('Server running in port 3000');
});
