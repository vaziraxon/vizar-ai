// Browsers ask for /favicon.ico whatever <link rel="icon"> says; send them to the app icon.
export function GET(request: Request) {
  return Response.redirect(new URL("/icon.png", request.url), 308);
}
