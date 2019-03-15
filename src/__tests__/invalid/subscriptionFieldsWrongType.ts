import { subscriptionFields } from '../../fields';
import { TSGraphQLString } from '../..';

subscriptionFields({}, (field) => ({
  string: field(
    { type: TSGraphQLString },
    async function* () {
      yield 4;
    },
  ),
}));
