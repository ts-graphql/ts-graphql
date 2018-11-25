import Implements from '../../Implements';

class Data {
  data!: string;
}

class SomeInterface {
  string!: string;
  number!: number;
  bool!: boolean;
  data!: Data;
}

class AnotherInterface {
  foo!: string;
}

@Implements(SomeInterface)
class A {
  string!: string;
  number!: Promise<number>;
  bool(): boolean {
    return false;
  };
  data() {
    return Promise.resolve(new Data());
  };
}

@Implements(SomeInterface)
@Implements(AnotherInterface)
class B {
  string!: string;
  number!: number;
  bool!: boolean;
  data!: Data;
  foo!: string;
}
