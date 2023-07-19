const assert = require('assert');
const rollupStarterPlugin = require('..');

assert.strictEqual(rollupStarterPlugin().name, 'vite-plugin-entries-build-cache');
