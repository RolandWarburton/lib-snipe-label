import { LabelGenerator } from "./src/label.ts";
import { downloadCanvas } from "./src/util.ts";
import { fetchQRCodeData, fetchQRCodeData_mock } from "./src/providers/api.ts";
import type { ILabelConfig } from "./src/types/label.ts";

export default LabelGenerator;
// utility to download the canvas in browsers
export { downloadCanvas };
// export types
export type { ILabelConfig };
// export these to inject into the label generator
export { fetchQRCodeData, fetchQRCodeData_mock };
