import { CanvasRenderer } from "./render/canvas.ts";
import { calculateLines } from "./logic/label.ts";
import type { ILabelConfig } from "./types/label.ts";

export class LabelGenerator {
  public config: ILabelConfig;
  constructor(config: ILabelConfig) {
    this.config = config;
  }

  public async makeLabel(qrValue: string): Promise<HTMLCanvasElement | Error> {
    const {
      width,
      height,
      text,
      margin,
      fetchQRData,
    } = this.config;

    try {
      // get the QR data to be encoded into the QR
      const qrData = await fetchQRData(qrValue);
      // create a new canvas
      const renderer = new CanvasRenderer(width, height);
      // calculate the width of the QR code
      const qrWidth = height;

      // draw the QR code on the canvas
      await renderer.drawQR(qrData, qrWidth);

      // get the remaining width to draw the text
      const maxTextWidth = width - qrWidth - margin;

      // start drawing text 20vh down from the top
      let yOffset = height * 0.2;

      // go through each line of text
      for (const block of text) {
        const fontSize = block.fontSize || 32;
        // split it into visual lines to draw
        const lines = calculateLines(
          block.text,
          maxTextWidth,
          fontSize,
          (t, s) => renderer.measureWidth(t, s),
        );

        // protect against writing text outside of the label
        if (yOffset + (fontSize * lines.length) > height) break;

        // draw each line on the label
        for (const line of lines) {
          renderer.drawText(line, qrWidth + 15, yOffset, fontSize);
          yOffset += fontSize;
        }
        yOffset += 32;
      }

      return renderer.canvas;
    } catch (e) {
      return e instanceof Error ? e : new Error("Unknown error");
    }
  }
}
