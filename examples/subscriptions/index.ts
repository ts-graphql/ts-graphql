import {
  buildFields,
  buildSubscriptionFields, fields,
  subscriptionFields, TSGraphQLString,
} from '../../src';
import { GraphQLObjectType, GraphQLSchema, execute, subscribe } from 'graphql';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import express from 'express';
import graphqlHTTP from 'express-graphql';

const delay = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

const subFields = subscriptionFields({}, (field) => ({
  date: field(
    { type: TSGraphQLString },
    async function* () {
      while (true) {
        await delay(1000);
        yield new Date().toISOString();
      }
    }
  ),
}));

const queryFields = fields({}, (field) => ({
  version: field({ type: TSGraphQLString }, () => '1.0.0'),
}));

const query = new GraphQLObjectType({
  name: 'Query',
  fields: buildFields(queryFields),
});

const subscription = new GraphQLObjectType({
  name: 'Subscription',
  fields: buildSubscriptionFields(subFields),
});

const schema = new GraphQLSchema({
  query,
  subscription,
});

const WS_PORT = 5000;

const websocketServer = createServer((request, response) => {
  response.writeHead(404);
  response.end();
});

websocketServer.listen(WS_PORT, () => console.log(
  `Websocket Server is now running on http://localhost:${WS_PORT}`
));

SubscriptionServer.create(
  {
    schema,
    execute,
    subscribe,
  },
  {
    server: websocketServer,
    path: '/graphql',
  },
);

const app = express();

app.use('/graphql', graphqlHTTP({
  schema,
  context: undefined,
  graphiql: true,
}));

app.listen(4000, () => {
  console.log('Running on http://localhost:4000/graphql')
});
