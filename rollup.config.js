import pkg from './package.json' assert { type: 'json' };
import typescript from '@rollup/plugin-typescript'
import dts from "rollup-plugin-dts"
import json from '@rollup/plugin-json';

export default [{
  input: 'src/index.ts',
  output: [
    { file: pkg.main, format: 'cjs' },
    { file: pkg.module, format: 'es' }
  ],
  plugins: [
    typescript(),
    json(),
  ],
  external: [
    'path',
    'chalk',
    'fs-extra',
    'fast-glob',
    'crypto',
    Object.keys({ ...pkg.peerDependencies })]
}, 
// {
//   input: 'dist/index.d.ts',
//   output: [{ file: 'dist/index.d.ts', format: 'es' }],
//   plugins: [dts()]
// }
];
