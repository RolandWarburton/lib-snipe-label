import LabelGenerator, {
  downloadCanvas,
  fetchQRCodeData_mock,
} from "../mod.ts";
import type { ILabelConfig } from "../src/types/label.ts";

let activeCanvas: HTMLCanvasElement | null = null;

// finds a HTML input by its ID, and parses the JSON from it
// Returns the parsed array
// deno-lint-ignore no-explicit-any
function decodeDataFromInput(domID: string): any[] {
  const node = document.getElementById(
    domID,
  ) as HTMLTextAreaElement;
  try {
    return JSON.parse(node.value);
  } catch (err) {
    console.error("Failed to parse label JSON:", err);
    return [];
  }
}

// when called it will render a label to a DOM node #canvasContainer
async function render() {
  const btn = document.getElementById("generateBtn");
  const dlBtn = document.getElementById("downloadBtn");
  const container = document.getElementById("canvasContainer");

  if (!container || !btn || !dlBtn) {
    let err = ""
    err += "could not find either #generateBtn, #downloadBtn, or #canvasContainer"
    err += "\nmake sure you are using HTML from the example provided"
    return false;
  }

  // set the result container text to be a string
  container.innerHTML = "Generating...";

  // get the label text and qr text from the input fields
  const textData = decodeDataFromInput("labelText");
  const qrVal =
    (document.getElementById("qrValue") as HTMLInputElement).value || "";

  const config: ILabelConfig = {
    width: 1050,
    height: 425,
    backgroundColor: "#ffffff",
    margin: 25,
    fileName: "label.png",
    apiBaseURL: "http://localhost:3030",
    text: textData,
    fetchQRData: fetchQRCodeData_mock,
  };
  const gen = new LabelGenerator(config);

  try {
    // make a new canvas label
    const canvas = await gen.makeLabel(qrVal);

    // draw it on the container
    container.innerHTML = "";
    if (canvas instanceof HTMLCanvasElement) {
      container.appendChild(canvas);
      // store a reference to the canvas for downloading
      activeCanvas = canvas;
    } else {
      container.innerText = "Error: " + canvas.message;
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      container.innerText = "Error: " + e.message;
    } else {
      container.innerText = "Error";
    }
  }
}

// wire up render button
document.getElementById("generateBtn")?.addEventListener("click", render);

// wire up download button
document.getElementById("downloadBtn")?.addEventListener("click", () => {
  if (activeCanvas) {
    downloadCanvas(activeCanvas, "snipe-label.png");
  } else {
    alert("Please generate a label first!");
  }
});

render();
