/**
 * @module
 * Browser library for generating encrypted asset labels for Snipe-IT.
 * Composes a QR code and text blocks onto an HTML Canvas.
 */

export { LabelGenerator as default, LabelGenerator } from "./src/label.ts";
export { downloadCanvas } from "./src/util.ts";
export { createQRProvider } from "./src/providers/crypto.ts";
export type { ILabelConfig, IText } from "./src/types/label.ts";
