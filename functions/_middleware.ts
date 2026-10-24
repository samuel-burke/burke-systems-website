// Cloudflare Pages middleware: sends the production pages.dev address to burke.systems.
// Branch previews (<branch>.burke-systems-website.pages.dev) are left alone.
const PAGES_HOST = "burke-systems-website.pages.dev";
const SITE_HOST = "burke.systems";

type Context = { request: Request; next: () => Promise<Response> };

export function onRequest({ request, next }: Context) {
  const url = new URL(request.url);
  if (url.hostname !== PAGES_HOST) return next();
  url.hostname = SITE_HOST;
  return Response.redirect(url.toString(), 301);
}
