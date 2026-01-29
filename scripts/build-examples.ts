import { build, stop } from "esbuild";
import { denoPlugins } from "esbuild-deno-loader";

console.log("🚀 Starting esbuild...");

await build({
  plugins: [...denoPlugins()],
  entryPoints: ["./mod.ts", "./examples/example.ts"],
  outdir: "./dist",
  bundle: true,
  format: "esm", // This ensures it stays an ESM library
  target: "esnext", // Modern JS for modern browsers
  platform: "browser",
  sourcemap: true,
});

console.log("✅ Build complete: ./dist/snipe-label.esm.js");
stop();
