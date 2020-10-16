import 'jest';
import 'reflect-metadata';
import { resolveType } from '../utils';
import { GraphQLString } from 'graphql';
import Field from '../Field';
import { Wrapper } from '../../wrappers/Wrapper';

class Foo {
  @Field()
  a: string = 'a';

  @Field()
  b = 'b';

  @Field()
  c: string | number = 4;
}

describe('utils', () => {
  describe('resolveType', () => {
    it('should resolve type through reflection if not supplied', () => {
      const type = resolveType(undefined, Foo.prototype, 'a');
      expect((type as Wrapper<any, any>).graphQLType).toEqual(GraphQLString);
    });

    it('should throw error if type not available', () => {
      expect(() => resolveType(undefined, Foo.prototype, 'b')).toThrow();
      expect(() => resolveType(undefined, Foo.prototype, 'c')).toThrow();
    });
  });
});
