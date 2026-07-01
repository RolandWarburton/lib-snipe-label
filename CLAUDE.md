# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
# Serve the library locally for use in a Docker container (port 3030) via scripts/serve-examples.ts
deno task serve-examples

# Build the example app into static files
deno task build-examples

# Tag the current commit with the deno.json version and push it (triggers the release workflow)
deno task create-release
```

## Architecture

This is a Deno library (`mod.ts` is the public entry point) published to JSR as `@wirecrop/snipeit-label`. It renders asset label images onto an HTML Canvas. Labels are composed of a QR code on the left and a stack of text blocks on the right.

### Data flow

1. **Consumer** creates a `LabelGenerator` with an `ILabelConfig` (dimensions, text blocks, and a `fetchQRData` provider function).
2. `LabelGenerator.makeLabel(qrValue)` calls the injected `fetchQRData(qrValue)` to resolve a string to encode into the QR.
3. `CanvasRenderer` (`src/render/canvas.ts`) creates a DOM `<canvas>`, draws the QR via the `qrcode` npm package, then draws each text block.
4. `calculateLines` (`src/logic/label.ts`) wraps text character-by-character using `CanvasRenderer.measureWidth` as the measure function.
5. The resulting `HTMLCanvasElement` is returned to the caller for display or download via `downloadCanvas` (`src/util.ts`).

### Provider pattern

`fetchQRData` is a dependency-injected function `(value: string) => Promise<string>`. One implementation is exported from `mod.ts`:

- `createQRProvider(hexKey)` — encrypts the value with AES-CBC using the provided 32-char hex key.

### Key constraint: browser-only

`CanvasRenderer` relies on `document.createElement("canvas")` and the browser Canvas API. This library is intended to run in the browser, not in Deno server-side.

## Local development workflow

To serve the library so a containerised consumer can import it over HTTP:

```sh
deno task serve-examples  # serves on http://host.docker.internal:3030
```

In the consuming app's `deno.json`, swap the JSR import for the local one:

```json
"snipeit-label": "http://host.docker.internal:3030/mod.ts"
```

And enable `host.docker.internal` in `docker-compose.yml`:

```yaml
extra_hosts:
  - 'host.docker.internal:host-gateway'
```

## Releasing

Releases are automated by `.github/workflows/release.yml`, which runs on any pushed `v*` tag: it verifies the tag matches `deno.json`, creates the GitHub release, and publishes to JSR via OIDC (no token needed — the JSR package must be linked to the GitHub repo).

1. Bump `version` in `deno.json` and commit.
2. Push the commit: `git push origin master`.
3. Run `deno task create-release` — it tags the commit `v<version>` and pushes the tag, which triggers the workflow.
