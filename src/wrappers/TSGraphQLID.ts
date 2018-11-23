import { GraphQLID } from 'graphql';
import { wrapScalar } from './Wrapper';

export default wrapScalar<string>(GraphQLID);
