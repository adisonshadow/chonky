import { Command } from 'commander';
import * as fs from 'node:fs';
import * as path from 'node:path';

const TEMPLATES: Record<string, TemplateConfig> = {
  default: {
    description: 'Basic Chonky project with React',
    files: {
      'package.json': generatePackageJson,
      'chonky.config.js': generateConfig,
      'tsconfig.json': generateTsConfig,
      'src/index.tsx': generateIndexTsx,
      'src/App.tsx': generateAppTsx,
      'src/requirements/user-sample.req.ts': generateSampleReq,
    },
  },
  minimal: {
    description: 'Minimal Chonky project (no UI)',
    files: {
      'package.json': generatePackageJson,
      'chonky.config.js': generateConfig,
      'tsconfig.json': generateTsConfig,
      'src/index.ts': () =>
        "import { defineRequirement } from '@chonky/runtime';\n\nconsole.log('Hello from Chonky!');\n",
    },
  },
};

interface TemplateConfig {
  description: string;
  files: Record<string, (projectName: string) => string>;
}

export function registerInitCommand(program: Command): void {
  program
    .command('init [project-name]')
    .description('Initialize a new Chonky project')
    .option('-t, --template <name>', 'Project template', 'default')
    .option('--force', 'Overwrite existing files', false)
    .action(async (projectName: string | undefined, opts: { template: string; force: boolean }) => {
      const name = projectName ?? path.basename(process.cwd());
      const template = TEMPLATES[opts.template];

      if (!template) {
        console.error(`Unknown template: ${opts.template}`);
        console.error(`Available templates: ${Object.keys(TEMPLATES).join(', ')}`);
        process.exit(1);
      }

      const targetDir = projectName ? path.resolve(process.cwd(), projectName) : process.cwd();

      if (projectName && !fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      console.log(`\n  Initializing Chonky project: ${name}`);
      console.log(`  Template: ${opts.template} — ${template.description}\n`);

      for (const [relPath, generator] of Object.entries(template.files)) {
        const fullPath = path.join(targetDir, relPath);
        const dir = path.dirname(fullPath);

        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        if (fs.existsSync(fullPath) && !opts.force) {
          console.log(`  skip  ${relPath} (already exists)`);
          continue;
        }

        fs.writeFileSync(fullPath, generator(name), 'utf-8');
        console.log(`  create  ${relPath}`);
      }

      console.log(`\n  Done! Next steps:\n`);
      if (projectName) {
        console.log(`    cd ${projectName}`);
      }
      console.log('    yarn install');
      console.log('    chonky dev\n');
    });
}

function generatePackageJson(projectName: string): string {
  return JSON.stringify(
    {
      name: projectName,
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'chonky dev',
        build: 'chonky build',
        test: 'vitest run',
      },
      dependencies: {
        '@chonky/core': '^0.1.0',
        '@chonky/runtime': '^0.1.0',
        react: '^19.0.0',
        'react-dom': '^19.0.0',
      },
      devDependencies: {
        '@chonky/cli': '^0.1.0',
        typescript: '^5.8.0',
        vitest: '^3.0.0',
      },
    },
    null,
    2,
  );
}

function generateConfig(_projectName: string): string {
  return `/** @type {import('@chonky/transpiler').ChonkyConfig} */
module.exports = {
  verification: {
    strictBinding: false,
  },
  ambiguity: {
    strictMode: false,
    generateReport: true,
  },
  optimizer: {
    silentMode: {
      imageFormatConversion: true,
      sizeReductionThreshold: 0.3,
    },
  },
};
`;
}

function generateTsConfig(_projectName: string): string {
  return JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'bundler',
        jsx: 'react-jsx',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        outDir: 'dist',
        rootDir: 'src',
      },
      include: ['src'],
    },
    null,
    2,
  );
}

function generateIndexTsx(_projectName: string): string {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
`;
}

function generateAppTsx(_projectName: string): string {
  return `import React from 'react';

export function App() {
  return (
    <div>
      <h1>Welcome to Chonky</h1>
      <p>Machine-first web development starts here.</p>
    </div>
  );
}
`;
}

function generateSampleReq(_projectName: string): string {
  return `import { defineRequirement } from '@chonky/runtime';

export const sampleRequirement = defineRequirement({
  id: 'REQ-SAMPLE-01',
  name: 'Sample Requirement',
  description: 'A sample requirement to demonstrate the defineRequirement API.',
  triggers: [
    {
      type: 'UI_EVENT',
      target: 'Button#submit',
      event: 'click',
    },
  ],
  preconditions: [
    {
      expression: 'formData.isValid',
      type: 'DATA_VALID',
    },
  ],
  sideEffects: [
    {
      type: 'API_CALL',
      target: '/api/submit',
      description: 'Submit form data to server',
    },
  ],
});
`;
}
