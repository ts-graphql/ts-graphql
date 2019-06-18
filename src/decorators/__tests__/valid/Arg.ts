import Arg from '../../Arg';
import { TSGraphQLID } from '../../..';
import { Maybe } from '../../../types';
import nullableInput from '../../../wrappers/nullableInput';
import list from '../../../wrappers/list';
import nullable from '../../../wrappers/nullable';
import listInput from '../../../wrappers/listInput';

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

  @Arg({ type: () => TSGraphQLID })
  id!: string | number;

  @Arg({ type: () => Data })
  data!: Data;

  @Arg({ type: () => nullableInput(Data) })
  maybeData: Maybe<Data>;

  @Arg({ type: () => listInput(Data) })
  dataList!: Data[];

  @Arg({ type: () => list(nullableInput(Data)) })
  nullableDataList!: Array<Maybe<Data>>;

  @Arg({ type: () => nullable(list(nullableInput(Data))) })
  maybeDataMaybeList: Maybe<Array<Maybe<Data>>>;
}
