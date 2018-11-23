import { GraphQLFloat } from 'graphql';
import { wrapScalar } from './Wrapper';

export default wrapScalar<number>(GraphQLFloat);
