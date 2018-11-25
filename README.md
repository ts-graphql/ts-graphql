# ts-graphql

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
GraphQL and TypeScript.


## Caveats

Input types used where an output type is expected and vice versa
won't show an error at compile time, they will immediately throw a runtime
error though.

Nullable fields on input types don't enforce that the TS property is
nullable. This is because `T`  `T | null`
