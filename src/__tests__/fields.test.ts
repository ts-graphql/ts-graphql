import { SubscriptionFieldConfigMap } from '../fields';

if (Symbol["asyncIterator"] === undefined) ((Symbol as any)["asyncIterator"]) = Symbol.for("asyncIterator");

import 'jest';
import {
  buildFields,
  fields,
  buildSubscriptionFields,
  subscriptionFields,
  TSGraphQLString,
  TSGraphQLInt,
} from '../index';
import { GraphQLObjectType, GraphQLSchema, subscribe, parse, graphql } from 'graphql';

const schemaForSubscriptionFields = (subFields: SubscriptionFieldConfigMap<any, any>) => {
  const query = new GraphQLObjectType({
    name: 'Query',
    fields: buildFields(fields({}, (field) => ({
      foo: field(
        { type: () => TSGraphQLString },
        () => 'Required query field',
      ),
    })))
  })

  const subscription = new GraphQLObjectType({
    name: 'Subscription',
    fields: buildSubscriptionFields(subFields),
  });

  return new GraphQLSchema({ query, subscription });
}

const querySubscriptionFields = (subFields: SubscriptionFieldConfigMap<any, any>, queryString: string) => {
  const schema = schemaForSubscriptionFields(subFields);

  const document = parse(queryString);

  return subscribe(schema, document);
}

describe('fields', () => {
  describe('buildSubscriptionFields', () => {
    it('should create working subscription type', async () => {
      const subFields = subscriptionFields({}, (field) => ({
        test: field(
          { type: () => TSGraphQLString },
          async function* () {
            yield 'A';
            yield 'B';
          },
        ),
      }));

      const result = await querySubscriptionFields(subFields, `
        subscription {
          test
        }
      `);

      const values = [];
      for await (const value of result as any) {
        values.push(value.data.test);
      }

      expect(values).toEqual(['A', 'B']);
    });

    it('should call resolver with yielded values', async () => {
      const subFields = subscriptionFields({}, (field) => ({
        test: field(
          { type: () => TSGraphQLInt },
          async function* () {
            yield 1;
            yield 2;
          },
          (num) => num * 2,
        ),
      }));

      const result = await querySubscriptionFields(subFields, `
        subscription {
          test
        }
      `);

      const values = [];
      for await (const value of result as any) {
        values.push(value.data.test);
      }

      expect(values).toEqual([2, 4]);
    });

    it('should return error if subscription queried incorrectly', async () => {
      const subFields = subscriptionFields({}, (field) => ({
        test: field(
          { type: () => TSGraphQLString },
          async function* () {
            yield 'A';
            yield 'B';
          },
        ),
      }));

      const schema = schemaForSubscriptionFields(subFields);

      const result = await graphql(schema, `
        subscription {
          test
        }
      `);

      expect(result.errors).toBeTruthy();
    });
  });
});
