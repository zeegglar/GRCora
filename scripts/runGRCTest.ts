import { GRCAIDualModeTest } from './testGRCAIDualMode';

async function runTest() {
  const tester = new GRCAIDualModeTest();
  await tester.runTests();
}

runTest().catch(console.error);