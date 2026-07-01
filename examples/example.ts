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

  const config: ILabelConfig = {
    width: 1050,
    height: 425,
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
    container.appendChild(canvas);
    activeCanvas = canvas;
  } catch (e: unknown) {
    container.innerText = "Error" + (e instanceof Error ? ": " + e.message : "");
  }
}

document.getElementById("generateBtn")?.addEventListener("click", render);

document.getElementById("downloadBtn")?.addEventListener("click", () => {
  if (activeCanvas) {
    downloadCanvas(activeCanvas, "snipe-label.png");
  } else {
    alert("Please generate a label first!");
  }
});

render();
