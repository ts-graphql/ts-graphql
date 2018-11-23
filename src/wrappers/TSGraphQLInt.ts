import { GraphQLInt } from 'graphql';
import { wrapScalar } from './Wrapper';

export default wrapScalar<number>(GraphQLInt);
