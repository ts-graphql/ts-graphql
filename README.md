# ts-graphql [![CircleCI](https://circleci.com/gh/stephentuso/ts-graphql.svg?style=svg)](https://circleci.com/gh/stephentuso/ts-graphql)  [![npm](https://img.shields.io/npm/v/ts-graphql.svg)](https://www.npmjs.com/package/ts-graphql) [![Coverage Status](https://coveralls.io/repos/github/stephentuso/ts-graphql/badge.svg?branch=dev)](https://coveralls.io/github/stephentuso/ts-graphql?branch=dev) [![Known Vulnerabilities](https://snyk.io/test/github/stephentuso/ts-graphql/badge.svg?targetFile=package.json)](https://snyk.io/test/github/stephentuso/ts-graphql?targetFile=package.json)

A TypeScript library for building GraphQL APIs in an efficient and
type safe way. 

<img src="https://raw.githubusercontent.com/stephentuso/ts-graphql/dev/example.gif">

Project goals:

 - As close to 100% type safety between GraphQL schema and code as possible;
   if it compiles, there shouldn't be runtime type errors
 - Single source of truth for both schema types and TS types
 - Lightweight wrapper around [graphql-js](https://github.com/graphql/graphql-js) -
   stay flexible and easy to comprehend
   
If you are looking for more of a full framework  - currently without as much type safety -
checkout [type-graphql](https://github.com/19majkel94/type-graphql).

## Why?

This library is the result of experiencing many frustrations while working with
GraphQL and TypeScript, whether that was programmatically with graphql-js, or 
writing schemas in the SDL and using something like graphql-cli to generate types from them. 

The main issues:

 - Either way, you have to write types twice. Even worse, since the SDL is either 
strings or text files, you can't use features of the language to DRY up common
args and types.

 - There is a disconnect between return values of resolvers and the field types
of the schema. For example, the resolver can return null, but the schema has it marked
as non null. This is a runtime error, and one that can't be caught immediately,
so unless you have every single field tested with every possible condition, 
the error won't be thrown until some point later in the QA cycle, 
potentially even after deployment.

This library solves both of those:

 - Every component of the schema has a single source of truth and support
   using `extends` to inherit fields/args.
 - Type mismatch errors for all schema components are enforced by TS types
   and shown at compile time

## Usage
 
Install with `yarn add ts-graphql`

### Patterns

The goal is to keep this simple and unopinionated. The only patterns required are:

 - 1:1 mapping between GraphQL types and TS types
 - Context type has to be a class

### Guide

To quickly try out the library, you can clone it and run the [examples](https://github.com/stephentuso/ts-graphql/blob/master/examples).
E.g. `npx ts-node examples/interface/index.ts`

Most decorators/functions for creating types accept all the same options as their counterparts in
`graphql-js`, but with a differently typed `type` option. For specifics, see the type definitions.

Lets start from the bottom:

### Standard Scalars

TS GraphQL provides wrapped versions of all the built-in scalars:

```typescript
import {
  TSGraphQLBoolean, 
  TSGraphQLFloat, 
  TSGraphQLID, 
  TSGraphQLInt, 
  TSGraphQLString,
} from 'ts-graphql';
```

### Object Types

Object types use the decorators `ObjectType` and `Field`. You can also define fields
separately from the source class, see [Modular Fields](#modular-fields).

> For `Field`, `InputField`, and `Arg`, you can leave out the `type` option
for properties explicitly typed as `string`, `number`, or `boolean`. 
For methods and other types it is required (this is enforced with TS types). 
It is best to explicitly set the type though - see [implicit type caveat](#implicit-types)

The `Field` decorator can be applied to a property or a method. The method takes
parameters `args`, `context` and `info`. `source` is left out as it is available as `this`.

```typescript
import {
  ObjectType,
  Field,
  TSGraphQLInt,
  TSGraphQLString,
} from 'ts-graphql';

@ObjectType()
class Vehicle {
  @Field({ description: 'Make of the vehicle' })
  make: string;
  
  @Field({ description: 'Model of the vehicle' })
  model: string;
  
  @Field({
    type: TSGraphQLInt,
    description: 'Year the vehicle was produced'
  })
  year: number;
  
  @Field({ type: TSGraphQLString })
  title() {
    return `${this.year} ${this.make} ${this.model}`;
  }
  
  //...
}
```

### Input Object Types

Input objects have different decorators from output objects: `InputObjectType` and `InputField`. 

```typescript
import {
  InputObjectType,
  InputField,
  TSGraphQLID,
} from 'ts-graphql';

@InputObjectType()
class ServiceRequestInput {
  @InputField({ type: TSGraphQLID })
  vehicleID!: string | number;
}
```

### Args

```typescript
import {
  Args,
  Arg,
  ObjectType,
  Field,
} from 'ts-graphql';

@Args()
class ServiceRequestArgs {
  @Arg({ type: ServiceRequestInput })
  input!: ServiceRequestInput;
}

// ...

// Usage

@ObjectType()
class Mutation {
  @Field({ type: ServiceRequestPayload, args: ServiceRequestArgs })
  requestService({ input }, context) {
    const { vehicleID } = input;
    // ...
  }
}
```

#### Root Types

There aren't any special functions for the root types, they are 
just object types. 

However, if you create them as classes, type safety is a little off as you won't have 
access to instances of those classes - resolver methods will be bound to whatever the 
root value is.

The best thing to do is use [modular fields](#modular-fields) 
with the source set to the type of your root value (if `undefined`, can leave it out) 
and then use `buildFields` to create a `GraphQLObjectType`:

```typescript
import { GraphQLObjectType } from 'graphql';
import { buildFields } from 'ts-graphql';
import fooQueryFields from './foo';
import barQueryFields from './bar';
// ...

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: () => buildFields([
    fooQueryFields,
    barQueryFields,
  ]),
});
``` 

#### Schema

`ts-graphql` doesn't provide its own method for building a schema. What it
provides are methods for generating types that the `GraphQLSchema` constructor
can accept:

```typescript
import { getObjectType, getNamedTypes } from 'ts-graphql';
import { GraphQLSchema } from 'graphql'
// ...

const schema = new GraphQLSchema({
  query: getObjectType(Query), // or if you followed whats above, just `Query`
  mutation: getObjectType(Mutation),
  types: getNamedTypes([
    Foo,
    Bar,
  ]),
}); 
```

### Modular Fields 

You can use the `fields` method to define fields separately from your object type source, 
and split them up if you want. This works well for the root types.

```typescript

// Foo.ts
import { ObjectType } from 'ts-graphql';
import { fooFieldsA } from './features/a.ts'
import { fooFieldsB } from './features/b.ts'

@ObjectType({
  fields: () => [fooFieldsA, fooFieldsB],
})
export default class Foo {
  data: string; 
  // ...
}

// features/a.ts
import { fields, TSGraphQLString } from 'ts-graphql';
import Foo from '../Foo.ts';

export const fooFieldsA = fields({ source: Foo }, (field) => ({
  data: field(
    { type: TSGraphQLString },
    (source) => source.data,
  ),
}));

// features/b.ts
import { fields, TSGraphQLInt } from 'ts-graphql';
import Foo from '../Foo.ts';

export const fooFieldsA = fields({ source: Foo }, (field) => ({
  dataLength: field(
    { type: TSGraphQLInt },
    (source) => source.data.length,
  ),
}));
```

### Custom Scalars

For your own scalars you can use `scalarType`:

```typescript
import { scalarType } from 'ts-graphql';

// ...

const Date = scalarType({
  name: 'Date',
  description: 'ISO-8601 string',
  serialize,
  parseValue,
  parseLiteral,
});
```

Or, you can wrap custom scalars, providing the TS type to associate:

```typescript
import { wrapScalar } from 'ts-graphql';
import SomeScalar from 'some-scalar';

const SomeScalarTyped = wrapScalar<SomeType>(SomeScalar);
```


## Caveats

There are a few things that can't be caught at compile time:

###### Nullable Input Fields

Nullable fields on input types don't enforce that the TS property is
nullable. This is because `T` is assignable to `T | null`, which works
fine for output types but not so much for input. There might be
a way to type this correctly but haven't figured it out yet.

###### Input/Output type checking

Input types used where an output type is expected and vice versa
won't show an error at compile time, they will immediately throw a runtime
error though.

###### Implicit Types

Leaving out the field type for properties implicitly typed as primitives 
won't throw a compile time error, but will immediately throw at runtime. For example:
```typescript
@Field()
shape: 'circle' | 'square';

@Field()
color = 'red';
```

###### Matching object types

Because TS is "duck-typed", if you manage to have two classes used for object
types that have the exact same fields, returning the wrong class can't be
caught at build time. E.g:

```typescript
@ObjectType()
class A { 
  @Field()
  foo!: string; 
}

@ObjectType()
class B {
  @Field()
  foo!: string
}

@ObjectType()
class C {
  @Field({ type: A })
  a() {
    return new B();
  }
}
```
