import { fieldDecoratorForContext } from '../../Field';
import { nullable, TSGraphQLID, TSGraphQLInt } from '../../..';
import { Maybe } from '../../../types';
import list from '../../../wrappers/list';
import Implements from '../../Implements';

class Data {
  value!: string;
}

@Implements(Data)
class DataImplementation {
  value() {
    return 'something';
  }
}

class SomeArgs {
  a!: string;
  b!: number;
  c!: boolean;
}

class Context {
  isAuthorized!: boolean;
}

const Field = fieldDecoratorForContext(Context);

class SomeType {
  @Field()
  string!: string;

  @Field()
  boolean!: boolean;

  @Field()
  number!: number;

  @Field({ type: nullable(TSGraphQLInt) })
  nullableInt: Maybe<number>;

  @Field({ type: TSGraphQLID })
  id!: Promise<string | number>;

  @Field({ type: Data })
  async data() {
    return new Data();
  }

  @Field({
    type: nullable(Data),
    args: SomeArgs,
    description: 'some data',
    isDeprecated: true,
    deprecationReason: 'old',
  })
  async oldData(args: SomeArgs, context: Context) {
    return null;
  }

  @Field({ type: Data })
  dataImpl() {
    return new DataImplementation();
  }

  @Field({ type: list(list(Data)) })
  dataImplArray() {
    return [[new DataImplementation()]];
  }
}
