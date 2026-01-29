export interface canvasOptions {
  background: string;
  width: number;
  height: number;
}

export interface IText {
  text: string;
  wrap: boolean;
  fontSize?: number;
}

// width 1050 = 300dpi / 89mm
// height 425 = 300dpi / 36mm
export interface ILabelConfig {
  width: number;
  height: number;
  backgroundColor?: string;
  margin: number;
  fileName: string;
  text: IText[];
  apiBaseURL: string;
  fetchQRData: (baseURL: string, value: string) => Promise<string>;
}
