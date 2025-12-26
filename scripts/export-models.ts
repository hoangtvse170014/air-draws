import { writeFileSync } from 'fs';
import { resolve } from 'path';

const main = () => {
  const outFile = resolve('dist', 'recognizer.json');
  writeFileSync(outFile, JSON.stringify({ status: 'todo' }, null, 2));
  console.log(`[export-models] wrote placeholder artifact to ${outFile}`);
};

main();

