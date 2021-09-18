const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(400).json('User not found!')
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userExists = users.some(user => user.username === username)

  if (userExists) {
    return response.status(400).json({ error: "User already exists!" })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  console.log(user)

  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  
  const todo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { id } = request.params

  const { user } = request

  const todoExists = user.todos.findIndex(todo => todo.id === id)

  if (todoExists === -1) {
    return response.status(404).json({error: 'Todo not exists!'})
  }

  user.todos[todoExists] = {
    ...user.todos[todoExists],
    title,
    deadline: new Date(deadline)
  }

  return response.status(201).json(user.todos[todoExists])
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params

  const { user } = request

  const todoExists = user.todos.findIndex(todo => todo.id === id)

  if (todoExists === -1) {
    return response.status(404).json({error: 'Todo not exists!'})
  }

  user.todos[todoExists].done = true

  return response.status(201).json(user.todos[todoExists])
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  
  const { user } = request

  const todoExists = user.todos.findIndex(todo => todo.id === id)

  if (todoExists === -1) {
    return response.status(404).json({error: 'Todo not exists!'})
  }

  user.todos.splice(todoExists, 1)

  return response.status(204).json(user.todos)
});

module.exports = app;