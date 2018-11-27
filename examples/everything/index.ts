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
  TSGraphQLInt,
  nullable,
  buildFields,
  fields,
  InputObjectType,
  InputField,
} from '../../src/index';
import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { random, times } from 'lodash';
import express from 'express';
import graphqlHTTP from 'express-graphql';

// -- Node --

type ID = string | number;

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

enum UserRole {
  ADMIN = 'ADMIN',
  STANDARD = 'STANDARD',
  GUEST = 'GUEST',
}

const UserRoleEnumType = new TSGraphQLEnumType(UserRole, { name: 'UserRole' });

@ObjectType()
@Implements(Node)
class User {

  // If a property is an explicitly typed string, number, or bool,
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
  @Field({ type: TSGraphQLInt })
  version = 1; // A plain value
  // version = Promise.resolve(1); // A Promise
  // version() { return 1 } // A resolver method (can also return Promise)

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
  @InputField()
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
  @Arg()
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
