import QRCode from "qrcode";

interface canvasOptions {
  background: string;
  width: number;
  height: number;
}

export class LabelGenerator {
  private api: string;
  public filename: string;
  public text: string[];
  public labelWidth: number;
  public labelHeight: number;
  constructor(
    api: string,
    filename: string,
    text: string[],
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

// makes a blank label
function makeLabelCanvas(
  options: canvasOptions = { background: "#ffffff", width: 1050, height: 425 },
):
  | {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
  }
  | Error {
  const { background, width, height } = options;
  const canvas = document.createElement("canvas");
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

function autoFitTextWithLogo(
  ctx: CanvasRenderingContext2D,
  text: string,
  labelWidth: number,
  labelHeight: number,
  margin: number,
  fontFamily: string = "sans-serif",
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
  text: string[],
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

  if (labelHeight > labelWidth) {
    throw new Error("portrait sized labels are unsupported");
  }

  // Truncate long words (scaled threshold)
  text.forEach((t, i) => {
    const maxLength = 25; // Scale the 33 char threshold
    if (t.length > maxLength) {
      text[i] = text[i].slice(0, 25) + "...";
    }
  });

  ctx.fillStyle = "#000000";
  ctx.textAlign = "left";

  const minOffset = 50;
  let offset = 0
  for (let i = 0; i < text.length; i++) {
    const t = text[i];
    const fontSize = autoFitTextWithLogo(
      ctx,
      t,
      labelWidth,
      labelHeight,
      25,
      "Monospace",
    );
    const nextOffset = fontSize * 2
    if (i === 0) {
      offset += fontSize
    } else {
      offset += nextOffset
    }
    if (offset < minOffset) {
      offset = minOffset;
    }
    ctx.font = `bold ${fontSize}px Monospace`;
    ctx.fillText(t, qrCanvas.width + 15, offset, canvas.width - qrCanvas.width);
  }

  return canvas;
}
