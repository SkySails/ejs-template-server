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

Add HTML with EJS syntax to the `raw` config option. When the server is created, EJS will parse the input for required variables, and will subsequently accept requests that contain these variables in its query params.

**`server.ts`**

```ts
import { createEjsTemplateServer } from 'ejs-template-server'
import { URLSearchParams } from 'url'
import axios from 'axios'

createEjsTemplateServer({
  template: {
    path: '/og-template.html',
  },
})
  .then(() => {
    const params = new URLSearchParams({
      title: 'Hello world!',
    }).toString()

    const result = axios.get(`http://localhost:8080?${params}`)

    // Do what you want with the result, see the advanced section for an example
  })
  .catch((e) => {
    console.log('The server was unable to start.', e)
    exit(1)
  })
```

### Advanced

Add the path to a file that you want to use as a template to the `path` config option. Like in the simple example, EJS will automatically recognize required parameters and check the query parameters for these.

In this example, however, [`playwright`](https://playwright.dev/) is used in order to programatically open the page and take a screenshot at a certain size.

**`server.ts`**

```tsx
import fs from 'fs'
import { createEjsTemplateServer } from 'ejs-template-server'
import { fileURLToPath, URLSearchParams } from 'url'
import { launchChromium } from 'playwright-aws-lambda'

const PORT = 8081

createEjsTemplateServer({
  template: {
    path: 'og-template.html',
  },
  staticParams: {
    getFontSize: (title: string) => (title?.length > 32 ? `text-7xl` : `text-9xl`),
  },
  port: PORT,
})
  .then(() => {
    generateImage('http://localhost:' + PORT)
  })
  .catch((e) => {
    console.log('The server was unable to start.', e)
    exit(1)
  })

function generateImage(url: string) {
  const params = new URLSearchParams({
    title: 'Hello world!',
    date: '2021-11-20',
    readTime: '2 minutes',
  }).toString()

  const url = `${baseURL}?${new URLSearchParams(params).toString()}`

  try {
    const browser = await launchChromium({ headless: true })
    const page = await browser.newPage()
    await page.setViewportSize({ width: 1200, height: 630 })
    await page.goto(url, { waitUntil: 'networkidle' })

    const buffer = await page.screenshot({ type: 'png' })
    await browser.close()

    fs.writeFileSync('output.png', buffer)
  } catch (error) {
    console.error(`An error occurred while generating the image.`, error)
    exit(1)
  }
}
```

**`og-template.html`**

```html
<main>
  <p>
    <% if (date) { %>
    <span><%= date %></span>
    <% } %> — <% if (readTime) { %>
    <span><%= readTime %></span>
    <% } %>
  </p>
  <h1 class="<%= getFontSize(title) %>"><%= title %></h1>
</main>
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
