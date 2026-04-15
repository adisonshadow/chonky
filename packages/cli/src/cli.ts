import { Command } from 'commander';
import { registerInitCommand } from './commands/init';
import { registerDevCommand } from './commands/dev';
import { registerBuildCommand } from './commands/build';
import { registerGraphCommand } from './commands/graph';
import { registerOptimizeCommand } from './commands/optimize';
import { registerViewCommand } from './commands/view';
import { registerRevertCommand } from './commands/revert';
import { registerRequirementsCommand } from './commands/requirements';

export const CLI_VERSION = '0.1.1';

export function createCli(): Command {
  const program = new Command();

  program
    .name('chonky')
    .description('Chonky CLI — the machine-first web development toolkit')
    .version(CLI_VERSION);

  registerInitCommand(program);
  registerDevCommand(program);
  registerBuildCommand(program);
  registerGraphCommand(program);
  registerOptimizeCommand(program);
  registerViewCommand(program);
  registerRevertCommand(program);
  registerRequirementsCommand(program);

  return program;
}
