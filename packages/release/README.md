# @yunquejs/release
npm package version management，include build、test、push github、npm publish

## Install
```
# npm
npm install -D @yunquejs/release

# yarn
yarn add -D @yunquejs/release

# pnpm
pnpm add -D @yunquejs/release
```

## Quick Start
```
yunque-release
```

## Publish Tag
```
yunque-release --tag next
```

## Use Package.json
```json
"yunque": {
  "release": {
    "skipTest": true
  }
}
```

## Extend Package.json
```
yunque-release --extend ../../package.json
```
```json
"yunque": {
  "release": {
    "skipTest": true,
    "extend": "../../package.json"
  }
}
```

## Get Help
```
yunque-release --help
```
