import { GraphQLID } from 'graphql';
import { wrapScalar } from './Wrapper';

export type ID = string | number;

export default wrapScalar<ID>(GraphQLID);
