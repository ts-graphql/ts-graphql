import {
  ObjectType,
  InterfaceType,
  Field,
  TSGraphQLID,
  Arg,
  Args,
  Implements,
  list,
  TSGraphQLEnumType,
  TSGraphQLString,
  TSGraphQLUnionType,
} from '../../src/index';
import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { random, times } from 'lodash';
import nullable from '../../src/wrappers/nullable';
import { buildFields, fields } from '../../src/fields';
import express from 'express';
import graphqlHTTP from 'express-graphql';
import InputObjectType from '../../src/decorators/InputObjectType';
import InputField from '../../src/decorators/InputField';

type ID = string | number;

enum UserRole {
  ADMIN = 'ADMIN',
  STANDARD = 'STANDARD',
  GUEST = 'GUEST',
}

const UserRoleEnumType = new TSGraphQLEnumType(UserRole, { name: 'UserRole' });

// -- Node --

@InterfaceType()
abstract class Node {
  @Field({ type: TSGraphQLID })
  id!: ID;
}

@Args()
class NodeArgs {
  @Arg({ type: TSGraphQLID })
  id!: ID;
}

@Args()
class NodesArgs {
  @Arg({ type: list(TSGraphQLID) })
  ids!: ID[];
}

const randomNode = (id: ID, recordContents: string = 'Lorem ipsum') => {
  return !!random(1, false)
    ? new User(id, UserRole.STANDARD, 'John Doe')
    : new Record(id, recordContents, new User('foo', UserRole.ADMIN, 'John Doe'))
}

// Works well to modularize Query/Mutation fields
const nodeQueryFields = fields({}, (field) => ({
  node: field(
    { type: Node, args: NodeArgs },
    (root, { id }) => {
      return randomNode(id);
    },
  ),

  nodes: field(
    { type: list(Node), args: NodesArgs },
    (root, { ids }) => {
      return ids.map((id) => randomNode(id));
    },
  ),
}));

// --- User ---

@ObjectType()
@Implements(Node)
class User {

  // If a property is a string, number, or bool (or synchronous method that returns those),
  // you can leave out the type option
  @Field()
  name: string;

  @Field({ type: UserRoleEnumType })
  role: UserRole;

  constructor(
    public id: ID,
    role: UserRole,
    name: string,
  ) {
    this.role = role;
    this.name = name;
  }
}

// --- Record ---

@ObjectType()
@Implements(Node)
class Record {
  // Properties can be
  @Field({ type: TSGraphQLString })
  version = 'v1'; // A plain value
  // version = Promise.resolve('v1'); // A Promise
  // version() { return 'v1' } // A resolver method (can also return Promise)

  @Field({ type: nullable(TSGraphQLString) })
  contents: string | null;

  @Field({ type: User })
  createdBy: User;

  constructor(
    public id: ID,
    contents: string,
    createdBy: User,
  ) {
    this.contents = contents;
    this.createdBy = createdBy;
  }
}

@InputObjectType()
class AddRecordInput {
  @InputField({ type: TSGraphQLString })
  contents!: string;

  @InputField({ type: TSGraphQLID })
  userID!: ID;
}

@Args()
class AddRecordArgs {
  @Arg({ type: AddRecordInput })
  input!: AddRecordInput;
}

@ObjectType()
class AddRecordPayload {
  @Field({ type: Record })
  record: Record;

  constructor(record: Record) {
    this.record = record;
  }
}

const recordMutationFields = fields({}, (field) => ({
  addRecord: field(
    { type: AddRecordPayload, args: AddRecordArgs },
    (root, { input }) => {
      const createdBy = new User(input.userID, UserRole.ADMIN, 'John Smith');
      return new AddRecordPayload(new Record('foo', input.contents, createdBy));
    }
  ),
}));

// -- Search --

const SearchResult = new TSGraphQLUnionType<User | Record>({
  name: 'SearchResult',
  types: [User, Record]
});

@Args()
class SearchResultArgs {
  @Arg({ type: TSGraphQLString })
  query!: string;
}

const searchQueryFields = fields({}, (field) => ({
  search: field(
    { type: list(SearchResult), args: SearchResultArgs },
    (root, { query }) => {
      return times(10, (n) => randomNode(n, query));
    },
  ),
}));

// -- Schema/App --

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: () => buildFields([
    nodeQueryFields,
    searchQueryFields,
  ]),
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => buildFields([
    recordMutationFields,
  ]),
});

const schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
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
