// calculates each visual line of text to draw as a continuous line
// returns an array of text
export function calculateLines(
  text: string,
  maxWidth: number,
  fontSize: number,
  measureFn: (text: string, fontSize: number) => number,
): string[] {
  const lines: string[] = [];
  let currentLine = "";

  // add each letter to the current line
  // until it exceeds the max width, then store it
  for (const char of text) {
    const testLine = currentLine + char;
    if (measureFn(testLine, fontSize) <= maxWidth) {
      currentLine = testLine;
    } else if (currentLine) {
      // current line is full, save it
      lines.push(currentLine);
      // reset the current line to be this char
      currentLine = char;
    }
  }
  // push the last line of text
  if (currentLine) lines.push(currentLine);
  return lines;
}
