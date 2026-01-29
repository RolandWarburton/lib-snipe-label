import QRCode from "qrcode";

export class CanvasRenderer {
  public canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(width: number, height: number) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");
    this.ctx = ctx;

    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(0, 0, width, height);
  }

  async drawQR(data: string, size: number): Promise<HTMLCanvasElement> {
    const qrCanvas = await QRCode.toCanvas(`myapp://${data}`, {
      width: size,
      margin: 2,
    });
    this.ctx.drawImage(qrCanvas, 0, 0);
    return qrCanvas;
  }

  drawText(text: string, x: number, y: number, fontSize: number) {
    this.ctx.fillStyle = "#000000";
    this.ctx.font = `bold ${fontSize}px Monospace`;
    this.ctx.fillText(text, x, y);
  }

  measureWidth(text: string, fontSize: number): number {
    this.ctx.font = `${fontSize}px Monospace`;
    return this.ctx.measureText(text).width;
  }
}
