import QRCode from "qrcode";

interface canvasOptions {
  background: string;
  width: number;
  height: number;
}

interface IText {
  text: string;
  wrap: boolean;
  fontSize?: number;
}

export class LabelGenerator {
  private api: string;
  public filename: string;
  public text: IText[];
  public labelWidth: number;
  public labelHeight: number;
  constructor(
    api: string,
    filename: string,
    text: IText[],
    labelWidth: number = 1050,
    labelHeight: number = 425,
  ) {
    this.api = api;
    this.filename = filename;
    this.text = text;
    this.labelWidth = labelWidth;
    this.labelHeight = labelHeight;
  }

  public async makeLabel(qrValue: string): Promise<HTMLCanvasElement | Error> {
    const qrString = await getQRCodeData(this.api, qrValue);
    if (typeof qrString !== "string") {
      return new Error("failed to fetch qr code string");
    }

    const label = await makeLabel(
      qrString,
      this.text,
      this.labelWidth,
      this.labelHeight,
    );
    if (label instanceof Error) {
      return new Error("failed to create QR");
    } else {
      return label;
    }
  }

  public async makeQR(
    qrString: string,
    size: number,
  ): Promise<HTMLCanvasElement | Error> {
    const qrStringEncoded = await getQRCodeData(this.api, qrString);
    if (typeof qrStringEncoded !== "string") {
      return new Error("failed to fetch qr code string");
    }
    return makeQR(qrStringEncoded, size);
  }
}

async function getQRCodeData(
  api: string,
  value: string,
): Promise<string | { error: Error }> {
  const apiURL = `${api}/qr/${value}`;
  // 1. Fetch QR data from API
  const response = await fetch(apiURL);
  if (!response.ok) throw new Error("Failed to fetch QR data");
  const qrData = await response.json();

  if (!qrData.code) {
    return {
      error: new Error("no data returned please check for errors in the api"),
    };
  }
  return qrData.code;
}

export type CanvasCreator = (w: number, h: number) => HTMLCanvasElement;

// makes a blank label
function makeLabelCanvas(
  options: canvasOptions = { background: "#ffffff", width: 1050, height: 425 },
  creator: CanvasCreator = (w, h) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  },
):
  | {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
  }
  | Error {
  const { background, width, height } = options;
  const canvas = creator(options.width, options.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new Error("failed to create canvas");
  } else {
    canvas.width = width;
    canvas.height = height;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
    return { canvas, ctx };
  }
}

async function makeQR(
  qrString: string,
  width: number,
): Promise<HTMLCanvasElement> {
  // generate QR code canvas feature
  const qrCanvas = await QRCode.toCanvas(`myapp://${qrString}`, {
    width: width,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
  return qrCanvas;
}

// !! DEPRICATED
function autoFitTextWithLogo(
  ctx: CanvasRenderingContext2D,
  text: string,
  labelWidth: number,
  labelHeight: number,
  margin: number,
  fontFamily: string = "Monospace",
): number {
  const logoSize = labelHeight; // Square logo occupies height × height
  const maxTextWidth = labelWidth - logoSize - margin; // Remaining space

  let fontSize = labelHeight * 0.8; // Start at 80% of label height (adjust as needed)

  do {
    ctx.font = `${fontSize}px ${fontFamily}`;
    const textWidth = ctx.measureText(text).width;

    // Exit if text fits or font is too small
    if (textWidth <= maxTextWidth || fontSize <= 8) break;

    // Reduce font size until text fits
    fontSize -= 1;
  } while (true);

  return fontSize;
}

// constructs final label
// overall label size (300dpi 36x89mm is 1050x425)
async function makeLabel(
  qrString: string,
  text: IText[],
  labelWidth: number,
  labelHeight: number,
): Promise<HTMLCanvasElement | Error> {
  // make blank label
  const result = makeLabelCanvas({
    background: "#ffffff",
    width: labelWidth,
    height: labelHeight,
  });
  if (result instanceof Error) {
    console.error("failed to make canvas");
    return result;
  }

  const { canvas, ctx } = result;
  const qrCanvas = await makeQR(qrString, labelHeight - 15);

  // Draw the QR code on the new canvas
  ctx.drawImage(qrCanvas, 0, 0);

  if (Number(labelHeight) > Number(labelWidth)) {
    throw new Error("portrait sized labels are unsupported");
  }

  ctx.fillStyle = "#000000";
  ctx.textAlign = "left";

  // iterate over each text object to draw
  const margin = 25;
  let chunkSize = 99;
  const maxFontSize = labelHeight * 0.2;

  let offset = maxFontSize;

  // for each text object
  for (let i = 0; i < text.length; i++) {
    const t = text[i];
    console.log(`processing line ${i}: ${text[i].text}`);

    // set font size
    const idealFontSize = t.fontSize || 32;
    console.log(`setting font size to ${idealFontSize}`);
    ctx.font = `${idealFontSize}px Monospace`;

    // split the text into chunks, each chunk is a line to draw on the label

    // first we need to know how many characters can be in a line
    // we need to know the remaining text width minus the logo and any margins
    // to figure out if this line is longer than the label (then reduce the chunk length)
    // NOTE this really only works well when the font is mono space

    // The labelHeight will be the QR code size in this case
    // because the QR is 1:1 ratio
    const maxTextWidth = labelWidth - labelHeight - margin;
    let textWidth = ctx.measureText(t.text.slice(0, chunkSize)).width;
    while (textWidth >= maxTextWidth) {
      if (chunkSize <= 5) break; // minimum 5 char per line
      chunkSize--;
      textWidth = ctx.measureText(t.text.slice(0, chunkSize)).width;
    }
    console.log(`chunk size: ${chunkSize}`);

    // now that we know our chunk size we can split our text into chunks
    // figure out how many lines of text this will require
    // "lorem ipsum dior sit amet" => " ["lorem ipsum", "dior sit amet"]
    const tLines: Array<string> = [];
    for (let j = 0; j < t.text.length; j += chunkSize) {
      tLines.push(t.text.slice(j, j + chunkSize));
    }
    console.log(`there are ${tLines.length} text lines to draw`);

    // prevent drawing lines outside of the label
    const nextLineGroupHeight = offset + idealFontSize * tLines.length;
    if (nextLineGroupHeight > labelHeight) {
      console.log("reached height of the label");
      break;
    }

    // draw the text
    for (let i = 0; i < tLines.length; i++) {
      const x = qrCanvas.width + 15;
      const y = offset;
      const t = tLines[i];
      console.log(`drawing text "${t}" at x:${x} y:${y}`);
      ctx.font = `bold ${idealFontSize}px Monospace`;
      ctx.fillText(t.trim(), x, y);
      if (i == tLines.length - 1) {
        offset += 32;
      } else {
        offset += idealFontSize;
      }
    }
    offset += 32;
  }
  return canvas;
}
