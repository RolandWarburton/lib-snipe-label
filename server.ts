import { serveDir } from "jsr:@std/http@^1.0.14/file-server";

Deno.serve({ port: 3030 }, async (req) => {
  return serveDir(req, {
    fsRoot: ".",
    showDirListing: true,
  });
});
