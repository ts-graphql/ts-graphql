import 'jest';
import { buildObjectType, Field, ObjectType, TSGraphQLString } from '../../index';
import unionType from '../unionType';
import { graphql, GraphQLSchema } from 'graphql';
import { resolveThunk } from '../../utils/thunk';

@ObjectType()
class A {
  @Field({ type: () => TSGraphQLString })
  a = 'a';
}

@ObjectType()
class B {
  @Field({ type: () => TSGraphQLString })
  b = 'b';
}

const AB = unionType<A | B>({ name: 'AB', types: [A, B]})

describe('unionType', () => {
  it('should resolve to correct type in schema', async () => {
    @ObjectType()
    class Query {
      @Field({ type: () => AB })
      a() {
        return new A();
      }

      @Field({ type: () => AB })
      b() {
        return new B();
      }
    }

    const schema = new GraphQLSchema({
      query: buildObjectType(Query),
    });

    const resultA = await graphql(schema, '{ a { ...on A { a } } }');
    const resultB = await graphql(schema, '{ b { ...on B { b } } }');

    expect(resultA.errors).toBeFalsy();
    expect(resultA.data!.a.a).toEqual('a');
    expect(resultB.errors).toBeFalsy();
    expect(resultB.data!.b.b).toEqual('b');
  });

  describe('resolveType', () => {
    it('should correctly resolve type', () => {
      const AType = buildObjectType(A);
      const BType = buildObjectType(B);

      const ABGql = resolveThunk(AB.graphQLType);
      expect(ABGql.resolveType!(new A(), null, {} as any)).toEqual(AType);
      expect(ABGql.resolveType!(new B(), null, {} as any)).toEqual(BType);
    });

    it('should throw error if called with unknown instance', () => {
      class Foo {}
      const ABGql = resolveThunk(AB.graphQLType);
      expect(() => ABGql.resolveType!(new Foo(), null, {} as any)).toThrow();
    });
  });
});
