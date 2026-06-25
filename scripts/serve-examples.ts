import { serveDir } from "file-server";

Deno.serve({ port: 3030 }, (req) => {
  const url = new URL(req.url);
  if (url.pathname === "/") {
    return Response.redirect(new URL("/examples/", req.url), 302);
  }
  return serveDir(req, {
    fsRoot: ".",
    showDirListing: true,
  });
});
