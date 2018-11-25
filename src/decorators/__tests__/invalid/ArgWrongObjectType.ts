import Arg from '../../Arg';

class A {
  a!: string;
}

class B {
  b!: string;
}

class Args {
  @Arg({ type: A })
  foo() {
    return B;
  }
}
