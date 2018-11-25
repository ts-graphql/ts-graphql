import Implements from '../../Implements';

class SomeInterface {
  a!: string;
  b!: number;
}

@Implements(SomeInterface)
class Foo {
  a!: string;
}
