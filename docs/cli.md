# @yunquejs/cli
A cli for creating front-end projects, encapsulating common templates, improving development efficiency.

## Install

```bash
npm install -g @yunquejs/cli
yarn global add @yunquejs/cli
pnpm add -g @yunquejs/cli
```

## Usage

```bash
yunque my-app
# Choose a template first
yunque vite-vue-template my-app
```

## Templates

| name                   | description                                                  |
| ---------------------- | ------------------------------------------------------------ |
| ts-template            | 一个 typescript 项目模版.                                    |
| vite-vue-template      | 一个后台管理系统模版, 使用 Vite2 + Vue3 + Vuex + Vue-Router + TypeScript + Ant-Design-Vue + Mockjs |
| vite-electron-template | 一个 Electron 模版, 使用 Vite2 + Vue3 + Electron12.          |
| vite-react-template    | 一个后台管理系统模版, 使用 Vite2 + React17 + Redux4 + React-Router6 + Windcss + Typescript + Ant-Design + Mockjs. |
| umi-windicss-template  | 一个后台管理系统模版, 使用 Umi + Windcss + Typescript + Ant-Design + Mockjs. |

## Adding a Template
1.Add the template information in the `templates/index.js` file.

2.Create a repo on `github`, the repo name is the same as the template name.

3.The name should be simple and clear, and end with `xxx-template`.

```js
  {
    name: 'ts-template',
    desc: '一个 typescript 项目模版.',
    repo: 'xinlei3166/vite-vue-template' // xinlei3166 是用户名，vite-vue-template 是仓库名
  }
```

## Git Repo Support
Git Repo `https://github.com/xinlei3166/vite-vue-template`

```bash
yunque xinlei3166/vite-vue-template my-app 
yunque github:xinlei3166/vite-vue-template my-app
```

Version / Tag

```bash
yunque xinlei3166/vite-vue-template/tree/v1.0.0 my-app
```

## View template list

```bash
yunque list
```

## Get Help

```bash
yunque --help
```

## Thanks
[@yunquejs/cli](https://github.com/yunquejs/yunque/tree/main/packages/cli) based on [sao](https://github.com/saojs/sao)
