#!/usr/bin/env node
const { createCli } = require('../dist/index.js');
createCli().parseAsync(process.argv);
