import 'jest';
import { getFilesInDir, typeCheckFiles } from '../../typeChecking';

describe('Root files type validation', () => {
  it('passes for valid files', async () => {
    const validFiles = await getFilesInDir(__dirname, 'valid');
    await typeCheckFiles(validFiles);
  }, 120000);

  it('fails for invalid files', async () => {
    const invalidFiles = await getFilesInDir(__dirname, 'invalid');
    await typeCheckFiles(invalidFiles, true);
  }, 1200000);
});
