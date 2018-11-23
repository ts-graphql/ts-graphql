import { GraphQLBoolean } from 'graphql';
import { wrapScalar } from './Wrapper';

export default wrapScalar<boolean>(GraphQLBoolean);
