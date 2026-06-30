export interface canvasOptions {
  background: string;
  width: number;
  height: number;
}

/** A single block of text to render on the label. */
export interface IText {
  /** The string to display. */
  text: string;
  /** Whether to word-wrap the text to fit the available width. */
  wrap: boolean;
  /** Font size in pixels. Defaults to 32. */
  fontSize?: number;
}

/**
 * Configuration for a label.
 * Dimensions at 300 dpi: 1050×425 px = 89×36 mm.
 */
export interface ILabelConfig {
  /** Canvas width in pixels. */
  width: number;
  /** Canvas height in pixels. */
  height: number;
  /** Background fill colour. Defaults to transparent. */
  backgroundColor?: string;
  /** Horizontal margin in pixels between the QR code and the text column. */
  margin: number;
  /** Default filename used when downloading the label. */
  fileName: string;
  /** Text blocks to render to the right of the QR code, top to bottom. */
  text: IText[];
  /** Resolves a raw asset value into the string to encode in the QR code. */
  fetchQRData: (value: string) => Promise<string>;
}
