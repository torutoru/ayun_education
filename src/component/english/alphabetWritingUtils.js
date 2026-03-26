const ALPHABET_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const GRID_SIZE = 64;
const GRID_PADDING = 8;
const FONT_STACK = "'Trebuchet MS', 'Arial Rounded MT Bold', Arial, sans-serif";
const MIN_DRAWN_PIXELS = 60;
const MIN_CONFIDENCE = 0.16;

const referenceCache = new Map();

function isMarkedPixel(data, offset) {
  const alpha = data[offset + 3];

  if (alpha < 20) {
    return false;
  }

  const brightness = (data[offset] + data[offset + 1] + data[offset + 2]) / 3;
  return brightness < 245;
}

function getBoundingBox(data, width, height) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;

      if (!isMarkedPixel(data, offset)) {
        continue;
      }

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX === -1 || maxY === -1) {
    return null;
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1
  };
}

function matrixFromCanvas(canvas, size = GRID_SIZE) {
  const context = canvas.getContext('2d');
  const { data } = context.getImageData(0, 0, size, size);
  const matrix = [];
  let activePixels = 0;

  for (let index = 0; index < size * size; index += 1) {
    const offset = index * 4;
    const active = isMarkedPixel(data, offset) ? 1 : 0;
    matrix.push(active);
    activePixels += active;
  }

  return {
    matrix,
    activePixels,
    size
  };
}

function normalizeCanvas(sourceCanvas, size = GRID_SIZE, padding = GRID_PADDING) {
  const context = sourceCanvas.getContext('2d');
  const sourceWidth = sourceCanvas.width;
  const sourceHeight = sourceCanvas.height;
  const imageData = context.getImageData(0, 0, sourceWidth, sourceHeight);
  const bounds = getBoundingBox(imageData.data, sourceWidth, sourceHeight);

  if (!bounds) {
    return null;
  }

  const normalizedCanvas = document.createElement('canvas');
  normalizedCanvas.width = size;
  normalizedCanvas.height = size;

  const normalizedContext = normalizedCanvas.getContext('2d');
  normalizedContext.fillStyle = '#ffffff';
  normalizedContext.fillRect(0, 0, size, size);

  const innerSize = size - padding * 2;
  const scale = Math.min(innerSize / bounds.width, innerSize / bounds.height);
  const drawWidth = bounds.width * scale;
  const drawHeight = bounds.height * scale;
  const drawX = (size - drawWidth) / 2;
  const drawY = (size - drawHeight) / 2;

  normalizedContext.drawImage(
    sourceCanvas,
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );

  return matrixFromCanvas(normalizedCanvas, size);
}

function renderReferenceMatrix(letter, size = GRID_SIZE) {
  const cacheKey = letter + '-' + size;

  if (referenceCache.has(cacheKey)) {
    return referenceCache.get(cacheKey);
  }

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, size, size);
  context.fillStyle = '#111111';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = '700 52px ' + FONT_STACK;
  context.fillText(letter.toUpperCase(), size / 2, size / 2 + 2);

  const result = normalizeCanvas(canvas, size, GRID_PADDING);
  referenceCache.set(cacheKey, result);
  return result;
}

function calculateIoU(userMatrix, referenceMatrix) {
  let intersection = 0;
  let union = 0;

  for (let index = 0; index < userMatrix.length; index += 1) {
    const userPixel = userMatrix[index];
    const referencePixel = referenceMatrix[index];

    if (userPixel || referencePixel) {
      union += 1;
    }

    if (userPixel && referencePixel) {
      intersection += 1;
    }
  }

  return union === 0 ? 0 : intersection / union;
}

function evaluateAlphabetDrawing(canvas, targetLetter) {
  const normalizedDrawing = normalizeCanvas(canvas);

  if (!normalizedDrawing || normalizedDrawing.activePixels < MIN_DRAWN_PIXELS) {
    return {
      isEmpty: true,
      isCorrect: false,
      guessedLetter: null,
      confidence: 0
    };
  }

  let bestLetter = null;
  let bestScore = 0;

  ALPHABET_LETTERS.forEach((letter) => {
    const reference = renderReferenceMatrix(letter);
    const score = calculateIoU(normalizedDrawing.matrix, reference.matrix);

    if (score > bestScore) {
      bestScore = score;
      bestLetter = letter;
    }
  });

  return {
    isEmpty: false,
    isCorrect: bestLetter === targetLetter && bestScore >= MIN_CONFIDENCE,
    guessedLetter: bestLetter,
    confidence: bestScore,
    normalizedDrawing
  };
}

export {
  ALPHABET_LETTERS,
  FONT_STACK,
  evaluateAlphabetDrawing,
  renderReferenceMatrix
};
