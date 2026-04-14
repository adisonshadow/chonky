export { createCli } from './cli';

// Auto-run when invoked as CLI binary
if (require.main === module) {
  const { createCli } = require('./cli');
  createCli().parseAsync(process.argv);
}
