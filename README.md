# ts-graphql

Project goals:

 - As close to 100% type safety between GraphQL schema and code as possible;
   if it compiles, there should never be runtime type mismatches
 - Single source of truth for both schema types and TS types
 - Lightweight wrapper around [graphql-js](https://github.com/graphql/graphql-js) -
   stay flexible and easy to comprehend

## Why?

This library is the result of experiencing many frustrations while working with
GraphQL and TypeScript.


## Caveats

The following can't be type checked at compile-time:

 - Input types used where an output type is expected and vice versa
 - 
