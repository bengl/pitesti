import Writable from 'stream';

export default pitestiBuilder;

// Creates a Pitesti suite
declare function pitestiBuilder(opts?: {
  outputStream?: Writable;
  done?(code:number):any;
  summary?: boolean;
  contextSeparator?: string;
}): Pitesti.PitestiSuite;

declare namespace Pitesti {
  export interface TestAdder {
    (
      testCase?: (cb?: (err?: any) => void) => void | Promise<void>,
      options?: { timeout?: number }
    ): void;
  }

  export interface PitestiSuite extends TestAdder {
    only: TestAdder;
    skip: TestAdder;
    context(name: string, contextCallback: () => void): undefined;
    subtest(name: string, contextCallback: () => void): undefined;
    test: PitestiSuite
  }
}
