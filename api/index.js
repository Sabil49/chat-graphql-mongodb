require('dotenv').config();
const { GraphQLServer, PubSub } = require('graphql-yoga');
const mongoose = require('mongoose');
const { merge } = require('lodash');
const config = require('../config');
const auth = require('./auth');
const channel = require('./channel');
const post = require('./post');
const requireAuth = require('./middlewares/auth.middleware');
const dataLoader = require('./dataLoader');

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true });
const pubsub = new PubSub();
const server = new GraphQLServer({
  typeDefs: [auth.typeDefs, post.typeDefs, channel.typeDefs].join(' '),
  resolvers: merge({}, auth.resolvers, post.resolvers, channel.resolvers),
  middlewares: [requireAuth],
  context: async (req) => ({
    ...req,
    pubsub,
    models: {
      user: auth.model,
      channel: channel.model,
      post: post.model,
    },
    loader: dataLoader
  }),
});

module.exports = server;
