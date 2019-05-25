import {
  ObjectType,
  InterfaceType,
  Field,
  Implements,
  buildObjectType,
  buildNamedTypes,
} from '../../src/index';
import { GraphQLSchema } from 'graphql';
import { random } from 'lodash';
import express from 'express';
import graphqlHTTP from 'express-graphql';

@InterfaceType()
abstract class Fruit {
  @Field()
  name!: string;

  @Field()
  color!: string;
}

@ObjectType()
@Implements(Fruit)
class Apple {
  name = 'Apple';

  @Field()
  variety: string;

  constructor(
    public color: string,
    variety: string,
  ) {
    this.variety = variety;
  }
}

@ObjectType()
@Implements(Fruit)
class Orange {
  name() {
    return 'Orange'
  }
  color = 'Orange';
}

@ObjectType()
class Query {
  @Field({ type: Fruit })
  async randomFruit() {
    return !!random(1, false)
      ? new Orange()
      : new Apple('Red', 'Red Delicious');
  }
}

const schema = new GraphQLSchema({
  query: buildObjectType(Query),
  types: buildNamedTypes([
    Apple,
    Orange,
  ]),
});

const app = express();

app.use('/graphql', graphqlHTTP({
  schema,
  context: undefined,
  graphiql: true,
}));

app.listen(4000, () => {
  console.log('Running on http://localhost:4000/graphql')
});
