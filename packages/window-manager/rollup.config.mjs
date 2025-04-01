import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import { dts } from 'rollup-plugin-dts';
import path from 'path';

const external = ['electron'];
const DIST_DIR = './dist';

// Common output configuration
const getOutputConfig = (format, extension, sourcemap = true, filename = 'index') => ({
  format,
  sourcemap,
  ...(extension && { file: path.join(DIST_DIR, `${filename}.${extension}`) }),
  exports: 'named',
});

const getTypeScriptConfig = (outDir) => typescript({
  tsconfig: path.resolve('./tsconfig.json'),
  sourceMap: true,
  declaration: false,
  outDir: path.resolve(outDir),
  exclude: ['**/*.spec.ts', '**/*.test.ts'],
});

// Base plugins configuration
const basePlugins = [
  nodeResolve({ preferBuiltins: true }),
  commonjs(),
  json(),
];

// Production plugins
const prodPlugins = [...basePlugins, terser()];

// Bundle configurations
const bundles = [
  // Main library bundles
  {
    input: 'src/index.ts',
    output: [
      getOutputConfig('cjs', 'js'),
      getOutputConfig('es', 'mjs'),
    ],
    external,
    plugins: [getTypeScriptConfig(DIST_DIR), ...prodPlugins],
  },
  // Preload bundles
  {
    input: 'src/preload.ts',
    output: [
      getOutputConfig('cjs', 'js', true, 'preload'),
      getOutputConfig('es', 'mjs', true, 'preload'),
    ],
    external,
    plugins: [getTypeScriptConfig(DIST_DIR), ...prodPlugins],
  },
  // Protocol bundles
  {
    input: 'src/protocol.ts',
    output: [
      getOutputConfig('cjs', 'js', true, 'protocol'),
      getOutputConfig('es', 'mjs', true, 'protocol'),
    ],
    external,
    plugins: [getTypeScriptConfig(DIST_DIR), ...prodPlugins],
  },
  // Type definitions
  {
    input: 'src/index.ts',
    output: getOutputConfig('es', 'd.ts', false),
    external,
    plugins: [dts()],
  },
  // Preload type definitions
  {
    input: 'src/preload.ts',
    output: getOutputConfig('es', 'd.ts', false, 'preload'),
    external,
    plugins: [dts()],
  },
  // Protocol type definitions
  {
    input: 'src/protocol.ts',
    output: getOutputConfig('es', 'd.ts', false, 'protocol'),
    external,
    plugins: [dts()],
  },
];

export default bundles;