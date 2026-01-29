import { serveDir } from "file-server";

Deno.serve({ port: 3030 }, (req) => {
  return serveDir(req, {
    fsRoot: ".",
    showDirListing: true,
  });
});
