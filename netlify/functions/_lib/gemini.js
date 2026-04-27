const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable.');
  }

  return apiKey;
}

function getGeminiImageModel() {
  return process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
}

function parseDataUrl(dataUrl) {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl || '');

  if (!match) {
    throw new Error('Expected a base64 data URL image.');
  }

  return {
    mimeType: match[1],
    data: match[2]
  };
}

async function requestGemini(model, body) {
  const response = await fetch(
    `${API_BASE}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(getGeminiApiKey())}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  );

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === 'string'
        ? payload
        : payload?.error?.message || payload?.message || `Gemini request failed with ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

function findImagePart(payload) {
  const candidates = Array.isArray(payload?.candidates) ? payload.candidates : [];

  for (const candidate of candidates) {
    const parts = Array.isArray(candidate?.content?.parts) ? candidate.content.parts : [];

    for (const part of parts) {
      const inlineData = part?.inlineData || part?.inline_data;

      if (inlineData?.data) {
        return {
          mimeType: inlineData.mimeType || inlineData.mime_type || 'image/png',
          data: inlineData.data
        };
      }
    }
  }

  return null;
}

async function preprocessArtImage({ imageDataUrl }) {
  const model = getGeminiImageModel();
  const source = parseDataUrl(imageDataUrl);
  const prompt = [
    'Edit this child drawing into a single full-body character concept for 3D conversion.',
    'Keep the original character identity, colors, and overall style cues.',
    'Remove background clutter and isolate one character on a plain white background.',
    'Center the character and show the full body from head to toe.',
    'Make the silhouette clean and readable for 3D modeling.',
    'Ensure the arms and legs are clearly separated from the torso.',
    'Prefer a neutral front-facing pose that is easy to rig, similar to an A-pose or T-pose.',
    'Do not add extra characters, props, text, frames, or scenery.'
  ].join(' ');

  const payload = await requestGemini(model, {
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: source.mimeType,
              data: source.data
            }
          }
        ]
      }
    ],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
      temperature: 0.4
    }
  });

  const imagePart = findImagePart(payload);

  if (!imagePart) {
    throw new Error('Gemini did not return an edited image.');
  }

  return {
    imageDataUrl: `data:${imagePart.mimeType};base64,${imagePart.data}`,
    model
  };
}

module.exports = {
  preprocessArtImage
};
