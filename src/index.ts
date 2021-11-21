import http from "http";
import URL from "url";
import ejs from "ejs";
import type { XOR } from "./types";

export interface EjsTemplateServerOptions {
  /** The (EJS compatible) HTML template to use when rendering the OG image.
   * @see https://ejs.co/
   */
  template: XOR<{ raw: string }, { path: string }>;
  /** The port that the server will try to listen on.
   * @default 8080
   */
  port?: number;
  staticParams?: Record<string, string | ((params: unknown) => unknown)>;
}

/**
 * Creates a server that is capable of rendering OG images on demand.
 * @param  {EjsTemplateServerOptions} options
 * @returns Promise
 */
export async function createEjsTemplateServer({
  template,
  port = 8080,
  staticParams,
}: EjsTemplateServerOptions): Promise<void> {
  if (!template.raw && !template.path) {
    console.error("No template provided, cannot start OpenGraph server.");
    return Promise.reject();
  }

  const srv = http
    .createServer(async (req, res) => {
      if (req.url) {
        if (template.path) {
          try {
            const html = await ejs.renderFile(template.path, { ...URL.parse(req.url, true).query, ...staticParams }); // prettier-ignore
            res.end(html);
          } catch (e: any) {
            const undefinedError = String(e).match(/.*is not defined/g);
            if (undefinedError) {
              console.error("Received invalid request:", undefinedError);
            } else {
              console.error(`Unable to read file at '${template.path}'.`, e);
            }
            return Promise.reject();
          }
        } else if (template.raw) {
          try {
            const html = await ejs.render(template.raw, { ...URL.parse(req.url, true).query, ...staticParams }); // prettier-ignore
            res.end(html);
          } catch (e) {
            console.error("The provided template is invalid:", template.raw);
            return Promise.reject();
          }
        }
      } else {
        res.end("Invalid url.");
      }
    })
    .listen(port);

  srv.on("listening", () => {
    console.log(
      "The EJS Template Server started successfully and is listening for requests to http://localhost:" +
        port
    );
    Promise.resolve();
  });
  srv.on("error", (e) => {
    console.error(e);
    Promise.reject();
  });
}
