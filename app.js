'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');
const schema = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const isAuth = require('./middleware/isAuth');

const PORT = 4000;

const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-methods', 'POST,GET,OPTIONS');
  res.setHeader('access-control-allow-headers', 'Content-type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
app.use(isAuth);

app.use('/graphql',
  graphqlHTTP({
    schema,
    rootValue: resolvers,
    graphiql: true
  }));

mongoose.connect(
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.qspiz.mongodb.net/event-graphql-db?retryWrites=true&w=majority`)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is started on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Error while connecting with mongodb : ${err}`);
  });
