import { GraphQLString } from 'graphql';
import { wrapScalar } from './Wrapper';

export default wrapScalar<string>(GraphQLString);
