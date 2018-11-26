# ts-graphql [![CircleCI](https://circleci.com/gh/stephentuso/ts-graphql.svg?style=svg)](https://circleci.com/gh/stephentuso/ts-graphql)  [![npm](https://img.shields.io/npm/v/ts-graphql.svg)](https://www.npmjs.com/package/ts-graphql) [![Coverage Status](https://coveralls.io/repos/github/stephentuso/ts-graphql/badge.svg?branch=dev)](https://coveralls.io/github/stephentuso/ts-graphql?branch=dev) [![Known Vulnerabilities](https://snyk.io/test/github/stephentuso/ts-graphql/badge.svg?targetFile=package.json)](https://snyk.io/test/github/stephentuso/ts-graphql?targetFile=package.json)

A TypeScript library for building GraphQL APIs in an efficient and
type safe way. 

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

TODO

See [example](https://github.com/stephentuso/ts-graphql/blob/master/examples/everything/index.ts) for now.

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

###### Literal Types

Omitting the type option on a literal type won't throw a compile time error,
but will immediately throw at runtime. For example
(contrived, would make more sense to use enum):
```typescript
@Field()
shape: 'circle' | 'square';
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
