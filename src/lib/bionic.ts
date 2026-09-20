/**
 * Cohart Bionic Reading Engine
 * Programmatically bolds the initial fixation point of words to guide the eye 
 * through text, enabling rapid comprehension for study and revision.
 */

export interface BionicWordPart {
  bold: string;
  regular: string;
}

export function parseBionicWord(word: string): BionicWordPart {
  // Check if word has leading punctuation/symbols
  const cleanMatch = word.match(/^([^a-zA-Z0-9]*)(.*?)([^a-zA-Z0-9]*)$/);
  if (!cleanMatch) {
    return { bold: word, regular: '' };
  }

  const [, prefix, core, suffix] = cleanMatch;
  if (!core) {
    return { bold: word, regular: '' };
  }

  const length = core.length;
  let fixationLength = 1;

  if (length <= 3) {
    fixationLength = 1;
  } else if (length <= 5) {
    fixationLength = 2;
  } else if (length <= 8) {
    fixationLength = 3;
  } else {
    fixationLength = Math.ceil(length * 0.45);
  }

  const boldPart = prefix + core.slice(0, fixationLength);
  const regularPart = core.slice(fixationLength) + suffix;

  return { bold: boldPart, regular: regularPart };
}

/**
 * Transforms plain text into an array of tokens suitable for direct React rendering
 */
export function formatBionicText(text: string): Array<{ id: number; bold: string; regular: string; space: boolean; newline: boolean }> {
  const lines = text.split('\n');
  const tokens: Array<{ id: number; bold: string; regular: string; space: boolean; newline: boolean }> = [];
  let idCounter = 0;

  lines.forEach((line, lineIndex) => {
    const words = line.split(/(\s+)/);
    words.forEach((chunk) => {
      if (/^\s+$/.test(chunk)) {
        tokens.push({
          id: idCounter++,
          bold: '',
          regular: chunk,
          space: true,
          newline: false,
        });
      } else if (chunk.length > 0) {
        const parsed = parseBionicWord(chunk);
        tokens.push({
          id: idCounter++,
          bold: parsed.bold,
          regular: parsed.regular,
          space: false,
          newline: false,
        });
      }
    });

    if (lineIndex < lines.length - 1) {
      tokens.push({
        id: idCounter++,
        bold: '',
        regular: '\n',
        space: false,
        newline: true,
      });
    }
  });

  return tokens;
}
