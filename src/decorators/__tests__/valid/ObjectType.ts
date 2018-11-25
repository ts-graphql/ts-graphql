import ObjectType from '../../ObjectType';

@ObjectType()
class SomeObject {}

@ObjectType({
  name: 'Foo',
  description: 'Foo',
  fields: [],
})
class AnotherObject {}
