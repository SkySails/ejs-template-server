# ejs-template-server

Ever wanted to automatically generate OpenGraph images based on a set of input parameters? This package makes it possible to spin up a short-lived server that can tranform a given template on request based un URL query parameters using a simple API.

## Installation

For most use cases, installing this package as a devDependency should be enough.

### Yarn

```bash
yarn add -D ejs-template-server
```

### NPM

```bash
npm install -D ejs-template-server
```

## Usage

### Simple

```ts
import { createEjsTemplateServer } from "ejs-template-server";

createEjsTemplateServer({
  template: {
    path: "/og-template.html",
  },
})
  .then(() => {
    generateImages("http://localhost:8080");
  })
  .catch((e) => {
    console.log("The server was unable to start.", e);
    exit(1);
  });
```

### Advanced

```tsx
import { createEjsTemplateServer } from "ejs-template-server";

createEjsTemplateServer({
  template: {
    path: "/og-template.html",
  },
  staticParams: {
    getFontSize: (title: string) =>
      title?.length > 32 ? `text-7xl` : `text-9xl`,
  },
  port: 8081,
})
  .then(() => {
    generateImages("http://localhost:8081");
  })
  .catch((e) => {
    console.log("The server was unable to start.", e);
    exit(1);
  });
```

## Options

The `createEjsTemplateServer` function only _requires_ that you provide a template (path or raw), but there are a few other options as well.

| Option       | Description                                                                     | Required | Type                                                     | Default |
| ------------ | ------------------------------------------------------------------------------- | -------- | -------------------------------------------------------- | ------- |
| template     | An object containing either a `raw` or a `path` key respectively.               | yes      | { raw?: string, path?: string }                          |         |
| port         | The port that the server should listen on.                                      | no       | 8080                                                     | 8080    |
| staticParams | Non-changing parameters that should be available at all times in the EJS scope. | no       | Record<string, string \| ((params: unknown) => unknown)> |         |

## Contributing

For guidelines and useful information, please see [CONTRIBUTING.md](https://github.com/SkySails/ejs-template-server/blob/main/CONTRIBUTING.md)

## License

[MIT](https://github.com/SkySails/ejs-template-server/blob/main/LICENSE)
