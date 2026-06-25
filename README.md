# Lib Snipe Label

Library for interacting with generating special labels for snipeit.

## API

```ts
import LabelGenerator, { createQRProvider, downloadCanvas } from "snipe-label";
import type { ILabelConfig } from "snipe-label";

const config: ILabelConfig = {
  // px (1050×425 = 300dpi at 89×36mm)
  width: 1050,
  height: 425,
  margin: 25,
  fileName: "label.png",
  fetchQRData: createQRProvider("d0a88aaefd18a43bae349ed01674bbd6"),
  text: [
    { text: "Asset Name", wrap: true, fontSize: 32 },
    { text: "TAG-001", wrap: false },
  ],
};

const canvas = await new LabelGenerator(config).makeLabel("TAG-001");
if (canvas instanceof HTMLCanvasElement) {
  downloadCanvas(canvas, "label.png");
}
```

## Development

1. change deno import
2. enable host.docker.internal
3. run the server

Run `deno task serve-examples` to serve the files to pickup in your docker container.

```json
// deno.json
{
  "imports": {
    "snipe-label": "https://raw.githubusercontent.com/thomsongeer/lib-snipe-label/master/mod.ts"
    // OR when developing
    "snipe-label": "http://host.docker.internal:3030/mod.ts"
  }
}
```

Enable `host.docker.internal` in your compose file.

```yaml
services:
  my_service:
    extra_hosts:
      - 'host.docker.internal:host-gateway'
```

Ensure your dockerfile has a github key.
For example in your `.env` set `GITHUB_TOKEN=github_pat_abcd1234`.

```dockerfile
ENV DENO_AUTH_TOKENS="${GITHUB_TOKEN}@raw.githubusercontent.com"
```
