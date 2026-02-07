// this is an example built-in function
// the purpose of this is to return a string
// to be embedded in the QR code
export async function fetchQRCodeData(
  baseURL: string,
  value: string,
): Promise<string> {
  const response = await fetch(`${baseURL}/qr/encode/${value}`);
  if (!response.ok) throw new Error("Failed to fetch QR data");
  const data = await response.json();
  if (!data.code) throw new Error("API returned no code");
  return data.code;
}

export function fetchQRCodeData_mock(
  _baseURL: string,
  _value: string,
): Promise<string> {
  return new Promise((r) => r("abcd123"));
}
