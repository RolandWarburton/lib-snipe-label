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
  constructor(api: string, filename: string, text: string[]) {
    this.api = api;
    this.filename = filename;
    this.text = text;
  }

  public async makeLabel(qrValue: string): Promise<HTMLCanvasElement | Error> {
    const qrString = await getQRCodeData(this.api, qrValue);
    if (typeof qrString !== "string") {
      return new Error("failed to fetch qr code string");
    }

    const label = await makeLabel(qrString, this.text);
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
  options: canvasOptions = { background: "#ffffff", width: 100, height: 100 },
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

// constructs final label
async function makeLabel(
  qrString: string,
  text: string[],
): Promise<HTMLCanvasElement | Error> {
  // overall label size (300dpi 36x89mm)
  const labelWidth = 1050;
  const labelHeight = 425;

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

  // truncate long words
  text.forEach((t, i) => {
    if (t.length > 33) {
      text[i] = text[i].slice(0, 29) + "...";
    }
  });

  // semi dynamic font sizing
  let fontSize = 50;
  if (text.length > 0) {
    const biggestWord = [...text].sort((a, b) => b.length - a.length)[0];
    if (biggestWord.length > 25) {
      fontSize = 32;
    } else if (biggestWord.length > 19) {
      fontSize = 40;
    } else if (biggestWord.length < 10) {
      fontSize = 64;
    }
    console.log(`fontsize is ${fontSize}`);
    console.log(`biggest text: ${biggestWord}`);
  }

  ctx.fillStyle = "#000000";
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = "left";

  let offset = 64;
  for (const t of text) {
    ctx.fillText(t, qrCanvas.width + 15, offset, canvas.width - qrCanvas.width);
    offset += 70;
  }

  return canvas;
}
