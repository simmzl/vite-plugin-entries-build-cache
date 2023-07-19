# rollup-starter-plugin

This repo contains bare-bones code for creating a [Rollup plugin](https://rollupjs.org/guide/en/#plugins).

## Getting started

Clone this repository and install its dependencies:

```bash
npx degit https://github.com/rollup/rollup-starter-plugin my-plugin
cd my-plugin
npm install
```

1. Edit `package.json`

2. Edit `src/index.js`

- rename the `starterPlugin` function
- change `name: 'starter-plugin'` to your plugin name
- implement or delete the function stubs. See [hooks guide](https://rollupjs.org/guide/en#hooks)

3. Add your preferred test framework and implement tests

See [conventions](https://rollupjs.org/guide/en/#conventions) for writing Rollup plugins.
