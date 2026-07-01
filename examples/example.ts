import LabelGenerator, {
  createQRProvider,
  downloadCanvas,
} from "../mod.ts";
import type { ILabelConfig, IText } from "../src/types/label.ts";

let activeCanvas: HTMLCanvasElement | null = null;

function decodeDataFromInput(domID: string): IText[] {
  const node = document.getElementById(domID) as HTMLTextAreaElement;
  try {
    return JSON.parse(node.value) as IText[];
  } catch (err) {
    console.error("Failed to parse label JSON:", err);
    return [];
  }
}

async function render() {
  const container = document.getElementById("canvasContainer");
  if (!container) return;

  container.innerHTML = "Generating...";

  const sizeSelect = document.getElementById("labelSize") as HTMLSelectElement;
  const [width, height] = sizeSelect.value.split("x").map(Number);

  const config: ILabelConfig = {
    width,
    height,
    backgroundColor: "#ffffff",
    margin: 25,
    fileName: "label.png",
    text: decodeDataFromInput("labelText"),
    fetchQRData: createQRProvider("d0a88aaefd18a43bae349ed01674bbd6"),
  };
  const qrVal = (document.getElementById("qrValue") as HTMLInputElement).value || "";

  try {
    const canvas = await new LabelGenerator(config).makeLabel(qrVal);
    container.innerHTML = "";
    // Display at a fixed fraction of the real (300 DPI) pixel size so
    // different label sizes preview at their true relative dimensions.
    const previewScale = 0.7;
    canvas.style.width = `${width * previewScale}px`;
    canvas.style.height = `${height * previewScale}px`;
    container.appendChild(canvas);
    activeCanvas = canvas;
  } catch (e: unknown) {
    container.innerText = "Error" + (e instanceof Error ? ": " + e.message : "");
  }
}

document.getElementById("generateBtn")?.addEventListener("click", render);
document.getElementById("labelSize")?.addEventListener("change", render);

document.getElementById("downloadBtn")?.addEventListener("click", () => {
  if (activeCanvas) {
    downloadCanvas(activeCanvas, "snipe-label.png");
  } else {
    alert("Please generate a label first!");
  }
});

render();
