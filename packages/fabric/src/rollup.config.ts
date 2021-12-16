// @ts-nocheck
import path from 'path'
import buble from '@rollup/plugin-buble'
import commonjs from '@rollup/plugin-commonjs'
import node from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import json from '@rollup/plugin-json'
import replace from '@rollup/plugin-replace'
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
// @ts-ignore
import pkg from '../package.json'

const moduleName = pkg.name
const version = process.env.VERSION || pkg.version
const cwd = process.cwd()
const resolve = dir => path.resolve(cwd, dir)

const banner =
  '/**\n' +
  ` * ${moduleName} v${version}\n` +
  ` * (c) 2021-${new Date().getFullYear()} ${pkg.author}\n` +
  ' * Released under the ISC License.\n' +
  ' */'

export function genConfig(input = 'src/index.ts', name) {
  return {
    input: resolve(input),
    external: [...Object.keys(pkg.dependencies)],
    plugins: [
      typescript({
        exclude: 'node_modules/**',
        typescript: require('typescript'),
        tsconfigOverride: {
          compilerOptions: {
            module: 'esnext',
            target: 'es5'
          }
        }
      }),
      node(),
      commonjs(),
      json(),
      babel({ babelHelpers: 'bundled', exclude: 'node_modules/**' }),
      terser(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      buble({
        objectAssign: 'Object.assign',
        transforms: {
          arrow: true,
          dangerousForOf: true,
          asyncAwait: false,
          generator: false
        }
      })
    ],
    output: {
      dir: resolve('dist'),
      entryFileNames: '[name].min.js',
      format: 'umd',
      exports: 'auto',
      banner,
      name: name || moduleName
    },
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg)
      }
    }
  }
}

export default genConfig()

// if use babel, need to create src/.babelrc.json
/*{
  presets: [
    [
      '@babel/env',
      {
        modules: false
      }
    ]
  ]
}*/

// if use rollup and babel, need to install these packages
/*
{
  "rollup": "^2.22.1",
  "rollup-plugin-terser": "^6.1.0",
  "rollup-plugin-typescript2": "^0.27.2",
  "@rollup/plugin-babel": "^5.1.0",
  "@rollup/plugin-buble": "^0.21.3",
  "@rollup/plugin-commonjs": "^14.0.0",
  "@rollup/plugin-json": "^4.1.0",
  "@rollup/plugin-node-resolve": "^8.4.0",
  "@rollup/plugin-replace": "^2.3.3",
  "@babel/core": "^7.10.5",
  "@babel/plugin-transform-runtime": "^7.10.5",
  "@babel/preset-env": "^7.10.4",
  "tslib": "^2.3.1",
}*/
