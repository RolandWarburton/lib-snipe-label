export function downloadCanvas(qrCanvas: HTMLCanvasElement, fileName: string) {
  qrCanvas.toBlob((blob: Blob | null) => {
    if (!blob) {
      throw new Error("Failed to generate QR code blob");
    }

    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.style.display = "none";

    // Trigger download
    a.click();

    // Cleanup
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  }, "image/png");
}
