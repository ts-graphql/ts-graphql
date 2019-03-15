if (Symbol["asyncIterator"] === undefined) ((Symbol as any)["asyncIterator"]) = Symbol.for("asyncIterator");

import 'jest';
import { buildFields, fields, buildSubscriptionFields, subscriptionFields, TSGraphQLString } from '../index';
import { GraphQLObjectType, GraphQLSchema, subscribe, parse } from 'graphql';

describe('fields', () => {
  describe('buildSubscriptionFields', () => {
    it('should create working subscription type', async () => {
      const subFields = subscriptionFields({}, (field) => ({
        test: field(
          { type: TSGraphQLString },
          async function* () {
            yield 'A';
            yield 'B';
          },
        ),
      }));

      const query = new GraphQLObjectType({
        name: 'Query',
        fields: buildFields(fields({}, (field) => ({
          foo: field(
            { type: TSGraphQLString },
            () => 'Required query field',
          ),
        })))
      })

      const subscription = new GraphQLObjectType({
        name: 'Subscription',
        fields: buildSubscriptionFields(subFields),
      });

      const schema = new GraphQLSchema({ query, subscription });

      const document = parse(`
        subscription {
          test
        }
      `);

      const result = await subscribe(schema, document);

      const values = [];
      for await (const value of result as any) {
        values.push(value.data.test);
      }

      expect(values).toEqual(['A', 'B']);
    });
  });
});
