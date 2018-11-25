import {
  ObjectType,
  InterfaceType,
  Field,
  TSGraphQLID,
  Arg,
  Args,
  getNamedTypes,
  getObjectType,
  Implements,
  list,
  TSGraphQLEnumType,
  TSGraphQLString,
  TSGraphQLUnionType,
} from '../src';
import { graphql, GraphQLSchema, printSchema } from 'graphql';
import { random, times } from 'lodash';
import nullable from '../src/wrappers/nullable';
import { fields } from '../src/fields';

type ID = string | number;

enum UserRole {
  ADMIN = 'ADMIN',
  STANDARD = 'STANDARD',
  GUEST = 'GUEST',
}

const UserRoleEnumType = new TSGraphQLEnumType(UserRole, { name: 'UserRole' });

@InterfaceType()
abstract class Node {
  @Field({ type: TSGraphQLID })
  id!: ID;
}

@ObjectType()
@Implements(Node)
class User {

  @Field({ type: UserRoleEnumType })
  role: UserRole;

  constructor(
    public id: ID,
    role: UserRole,
  ) {
    this.role = role;
  }
}

@ObjectType()
@Implements(Node)
class Record {
  @Field({ type: TSGraphQLString })
  test = 'test';

  @Field({ type: TSGraphQLString })
  contents: string;

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

const SearchResult = new TSGraphQLUnionType<User | Record>({
  name: 'SearchResult',
  types: [User, Record]
});

@Args()
class SearchResultArgs {
  @Arg({ type: TSGraphQLString })
  query!: string;
}

const randomNode = (id: ID, recordContents: string = 'Lorem ipsum') => {
  return !!random(1, false)
    ? new User(id, UserRole.STANDARD)
    : new Record(id, recordContents, new User('foo', UserRole.ADMIN))
}


@ObjectType()
class Query {
  @Field({ type: nullable(Node), args: NodeArgs })
  test() {
    return randomNode(this.constructor.name);
  }

  @Field({ type: Query })
  query() {
    console.log(this);
    return new Query();
  }

  @Field({ type: Node, args: NodeArgs })
  node({ id }: NodeArgs) {
    return randomNode(this.constructor.name);
  }

  @Field({ type: list(Node), args: NodesArgs })
  nodes({ ids }: NodesArgs) {
    return ids.map((id) => randomNode(id));
  }

  @Field({ type: list(SearchResult), args: SearchResultArgs })
  search({ query }: SearchResultArgs) {
    return times(10, (num) => randomNode(num, query));
  }
}

@ObjectType({

})
class Query2 {}

const queryFields = fields({ source: Query2 }, (field) => ({
  nodes: field()
}));

const schema = new GraphQLSchema({
  query: getObjectType(Query),
  types: getNamedTypes([
    Node,
    User,
    Record,
  ])
});

console.log(printSchema(schema));

const query = `
query {
test(id: "test") { id }
query {
  node(id: "blah") {
    ...userFields
    ...recordFields
  }
  nodes(ids: ["foo", "bar"]) {
    ...userFields
    ...recordFields
    
  }
  search(query: "Cats") {
    ...userFields
    ...recordFields
  }
  }
}

fragment recordFields on Record {
  test
  id
  contents
  createdBy {
    ...userFields
  }
}

fragment userFields on User {
  id
  role
}
`;

graphql(schema, query).then(({ data, errors }) => {
  console.log(JSON.stringify(data, null, 2));
  if (errors) {
    console.error(errors);
  }
});
