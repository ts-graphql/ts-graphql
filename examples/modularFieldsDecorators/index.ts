import {
  buildExtensions,
} from '../../src/index';
import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import express from 'express';
import graphqlHTTP from 'express-graphql';
import { FooQueryFields } from './foo';
import { BarQueryFields } from './bar';
import Root from './Root';

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: buildExtensions([
    FooQueryFields,
    BarQueryFields,
  ]),
});

const schema = new GraphQLSchema({
  query: Query,
});

const app = express();

app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: new Root(),
  context: undefined,
  graphiql: true,
}));

app.listen(4000, () => {
  console.log('Running on http://localhost:4000/graphql')
});
