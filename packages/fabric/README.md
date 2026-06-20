# @yunquejs/fabric

A collection of configuration files containing prettier, eslint, rollup.

## Install

```bash
# npm
npm install -D @yunquejs/fabric

# yarn
yarn add -D @yunquejs/fabric

# pnpm
pnpm add -D @yunquejs/fabric
```

## Usage

git `verify-commit`

need install simple-git-hooks

```json
"simple-git-hooks": {
  "pre-commit": "lint-staged --concurrent false",
  "commit-msg": "verify-commit $1"
}
```

in `.eslintrc.js`

```js
module.exports = {
  extends: [require.resolve('@yunquejs/fabric/dist/eslint')]
}
```

in `.prettierrc.js`

```js
const prettier = require('@yunquejs/fabric/dist/prettier')

module.exports = {
  ...prettier
}
```
