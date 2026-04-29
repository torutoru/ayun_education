const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable.');
  }

  return apiKey;
}

function getGeminiImageModel() {
  return process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image-preview';
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
    'This is an image-editing task, not a text-to-image generation task.',
    'Using the provided child drawing as the source image, edit it into an image that follows Meshy Image to 3D best-practice input guidelines.',
    'The output should show one single, clearly defined main character only.',
    'Keep the main character attributes from the original drawing: identity, silhouette, line shapes, colors, proportions, expression, clothing, accessories, and distinctive marks.',
    'Preserve the child-drawing style and the original character design as much as possible.',
    'Do not redesign the main character, do not replace it with a different character, and do not invent new visual details.',
    'Prepare the image for clean Image to 3D generation: use a plain white or very simple background, strong character/background contrast, clean sharp outlines, and clear visible details.',
    'Center the main character and keep the full body visible from head to toe, preferably front-facing or slightly angled only if it reveals the character shape better.',
    'If the legs or feet are missing, cropped, hidden, or unclear, reconstruct simple legs and feet in the same child-drawing style while preserving the main character design.',
    'For a humanoid character that will be rigged and animated, adjust only as needed toward an easy A-pose or T-pose while keeping the original pose feeling as close as possible.',
    'If arms or legs are touching the torso, separate them just enough to make the body parts readable for rigging.',
    'Remove distractions that Meshy should avoid: extra objects, extra characters, busy backgrounds, text, captions, frames, shadows, dramatic lighting, smoke, fog, particles, blur, muddy details, and very thin unclear details.',
    'Only make the minimum edits needed to make the original main character suitable for Meshy Image to 3D.',
    'Return one edited image only.'
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
      responseModalities: ['IMAGE'],
      temperature: 0.2
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
