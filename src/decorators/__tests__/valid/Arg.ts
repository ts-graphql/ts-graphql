import Arg from '../../Arg';
import { TSGraphQLID } from '../../..';

class Data {
  foo!: number;
}

class Args {
  @Arg()
  string!: string;

  @Arg()
  int: number = 4;

  @Arg()
  bool!: boolean;

  @Arg({ type: TSGraphQLID })
  id!: string | number;

  @Arg({ type: Data })
  data!: Data;
}
