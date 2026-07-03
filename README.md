# Lib Snipe Label

[![JSR](https://jsr.io/badges/@wirecrop/snipeit-label)](https://jsr.io/@wirecrop/snipeit-label)

Library for generating special encrypted labels for snipeit.

## API

```ts
import LabelGenerator, { createQRProvider, downloadCanvas } from "jsr:@wirecrop/snipeit-label";
import type { ILabelConfig } from "jsr:@wirecrop/snipeit-label";

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
