import { LabelGenerator } from "./src/label.ts";
import { downloadCanvas } from "./src/util.ts";
import { createQRProvider } from "./src/providers/crypto.ts";
import type { ILabelConfig } from "./src/types/label.ts";

export default LabelGenerator;
export { downloadCanvas };
export type { ILabelConfig };
export { createQRProvider };
