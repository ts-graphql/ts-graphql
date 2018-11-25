import Arg from '../../Arg';
import { TSGraphQLString } from '../../..';

class Args {
  @Arg({ type: TSGraphQLString })
  foo!: number;
}

