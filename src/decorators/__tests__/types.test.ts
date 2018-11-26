import 'jest';
import { exec } from 'child_process';
import { readdir } from 'fs';
import pify from 'pify';
import path from 'path';

// Would be better to do this programmatically, didn't look straightforward though.
const typeCheckFiles = async (files: string[], expectError?: boolean) => {
  await Promise.all(files.map(file => new Promise((resolve, reject) => {
    const tscArgs = '--strict --experimentalDecorators --emitDecoratorMetadata  --noEmit --lib esnext';
    exec(`$(npm bin)/tsc ${tscArgs} ${file}`, (err) => {
      if ((err && expectError) || (!err && !expectError)) {
        resolve();
      } else {
        reject(new Error(expectError
          ? 'Types valid, expected invalid'
          : 'Types invalid, expected valid',
        ));
      }
    });
  })));
};

const getFiles = async (directory: string): Promise<string[]> => {
  const files = await pify(readdir)(path.join(__dirname, directory));
  return files.map((file: string) => path.join(__dirname, directory, file));
}

describe('Decorator type validation', () => {
  it('passes for valid files', async () => {
    const validFiles = await getFiles('valid');
    await typeCheckFiles(validFiles);
  }, 30000);

  it('fails for invalid files', async () => {
    const invalidFiles = await getFiles('invalid');
    await typeCheckFiles(invalidFiles, true);
  }, 30000);
});
