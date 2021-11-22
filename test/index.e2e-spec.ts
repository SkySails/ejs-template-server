import { createEjsTemplateServer, EjsTemplateConfig } from '../src/index'
import puppeteer, { Browser, Page } from 'puppeteer'
import { Server } from 'http'

const createServer = async (template: EjsTemplateConfig) =>
  createEjsTemplateServer({
    template,
    port: 8456,
  })

describe('EJS Template Server', () => {
  let browser: Browser
  let page: Page
  let server: Server

  beforeAll(async () => {
    browser = await puppeteer.launch()
    page = await browser.newPage()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  it("given the template '<h1><%= title %><h1>', when the query is 'Hello world!' should render a heading tag with the text 'Hello world'", async () => {
    server = await createServer({ raw: '<h1><%= title %></h1>' })
    await page.goto('http://localhost:8456?title=Hello%20world%21')
    const heading = await page.waitForSelector('h1')
    const text = await page.evaluate((el) => el.textContent, heading)
    expect(text).toContain('Hello')
  })

  it("given the template '<h1><%= title %><h1>', when the query is empty, should log error with missing params & have status 403", async () => {
    server = await createServer({ raw: '<h1><%= title %></h1>' })
    const response = await page.goto('http://localhost:8456')
    expect(response.status()).toBe(403)
    expect(console.error).toHaveBeenCalledWith('Received invalid request:', ['title is not defined'])
  })

  it("given a path to a test template, when the query is 'Hello world', should render a heading tag with the text 'Hello world' ", async () => {
    server = await createServer({ path: 'test/test-template.html' })
    await page.goto('http://localhost:8456?title=Hello%20world%21')
    const heading = await page.waitForSelector('h2')
    const text = await page.evaluate((el) => el.textContent, heading)
    expect(text).toContain('Hello')
  })

  it('given a path to an non-existing template, should throw', async () => {
    expect(() => createServer({ path: 'nonexistent' })).rejects.toThrowError(
      'ENOENT: Invalid path provided, no template was found',
    )
  })

  afterAll(() => {
    browser.close()
  })

  afterEach(async () => {
    jest.resetAllMocks()

    await new Promise((r) => {
      server.close(r)
    })
  })
})
