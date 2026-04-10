const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..', '..', '..');
const ENV_PATH = path.join(ROOT_DIR, '.env');
const SAMPLE_IMAGE_PATH = path.join(__dirname, 'sample', 'sample.jpg');
const OUTPUT_DIR = path.join(__dirname, 'output');
const API_BASE = 'https://api.meshy.ai/openapi/v1';
const DEFAULT_ACTION_ID = Number.parseInt(process.env.MESHY_TEST_ACTION_ID || '22', 10);
const POLL_INTERVAL_MS = 8000;
const MAX_POLL_ATTEMPTS = 90;

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};

  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    env[key] = value;
  });

  return env;
}

function getApiKey() {
  const localEnv = readEnvFile(ENV_PATH);
  const apiKey = process.env.MESHY_API_KEY || localEnv.MESHY_API_KEY;

  if (!apiKey || apiKey === 'your_meshy_api_key_here') {
    throw new Error('MESHY_API_KEY가 설정되지 않았습니다. .env 파일에 실제 Meshy API 키를 넣어 주세요.');
  }

  return apiKey;
}

async function requestMeshy(apiKey, endpoint, options = {}) {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    ...(options.headers || {})
  };

  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === 'string'
        ? payload
        : payload?.message || payload?.error || payload?.detail || `Meshy 요청 실패: ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ensureOutputDir() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function readSampleAsDataUrl(imagePath) {
  const buffer = fs.readFileSync(imagePath);
  return `data:image/jpeg;base64,${buffer.toString('base64')}`;
}

async function pollTask(apiKey, endpointPrefix, taskId) {
  for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt += 1) {
    const task = await requestMeshy(apiKey, `/${endpointPrefix}/${encodeURIComponent(taskId)}`, {
      method: 'GET'
    });

    console.log(`[${endpointPrefix}] attempt ${attempt}: ${task.status}`);

    if (task.status === 'SUCCEEDED') {
      return task;
    }

    if (task.status === 'FAILED' || task.status === 'CANCELED' || task.status === 'EXPIRED') {
      throw new Error(task.task_error?.message || `${endpointPrefix} 작업 실패`);
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error(`${endpointPrefix} 작업이 제한 시간 내에 끝나지 않았습니다.`);
}

async function downloadFile(url, destinationPath) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`파일 다운로드 실패: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(destinationPath, Buffer.from(arrayBuffer));
}

async function main() {
  const apiKey = getApiKey();
  const localEnv = readEnvFile(ENV_PATH);

  if (!fs.existsSync(SAMPLE_IMAGE_PATH)) {
    throw new Error(`샘플 이미지가 없습니다: ${SAMPLE_IMAGE_PATH}`);
  }

  ensureOutputDir();

  console.log('1) image-to-3d 작업 생성');
  const imageDataUrl = readSampleAsDataUrl(SAMPLE_IMAGE_PATH);
  const imageStart = await requestMeshy(apiKey, '/image-to-3d', {
    method: 'POST',
    body: JSON.stringify({
      image_url: imageDataUrl,
      should_texture: true,
      image_enhancement: true,
      moderation: false,
      pose_mode: 't-pose',
      ai_model: localEnv.MESHY_IMAGE_MODEL || 'latest',
      target_formats: ['glb']
    })
  });

  const imageTaskId = imageStart.result;
  console.log(`image-to-3d task id: ${imageTaskId}`);

  console.log('2) image-to-3d 완료 대기');
  const imageTask = await pollTask(apiKey, 'image-to-3d', imageTaskId);

  console.log('3) remesh 작업 생성');
  const remeshStart = await requestMeshy(apiKey, '/remesh', {
    method: 'POST',
    body: JSON.stringify({
      input_task_id: imageTaskId,
      target_formats: ['glb'],
      topology: 'triangle',
      target_polycount: 120000,
      resize_height: 1.1,
      origin_at: 'bottom'
    })
  });

  const remeshTaskId = remeshStart.result;
  console.log(`remesh task id: ${remeshTaskId}`);

  console.log('4) remesh 완료 대기');
  const remeshTask = await pollTask(apiKey, 'remesh', remeshTaskId);

  console.log('5) rigging 작업 생성');
  const rigStart = await requestMeshy(apiKey, '/rigging', {
    method: 'POST',
    body: JSON.stringify({
      input_task_id: remeshTaskId,
      height_meters: 1.1
    })
  });

  const rigTaskId = rigStart.result;
  console.log(`rigging task id: ${rigTaskId}`);

  console.log('6) rigging 완료 대기');
  const rigTask = await pollTask(apiKey, 'rigging', rigTaskId);

  console.log('7) animation 작업 생성');
  const animationStart = await requestMeshy(apiKey, '/animations', {
    method: 'POST',
    body: JSON.stringify({
      rig_task_id: rigTaskId,
      action_id: DEFAULT_ACTION_ID,
      post_process: {
        operation_type: 'change_fps',
        fps: 30
      }
    })
  });

  const animationTaskId = animationStart.result;
  console.log(`animation task id: ${animationTaskId}`);

  console.log('8) animation 완료 대기');
  const animationTask = await pollTask(apiKey, 'animations', animationTaskId);

  const glbUrl = animationTask.animation_glb_url || animationTask.result?.animation_glb_url;

  if (!glbUrl) {
    throw new Error('animation_glb_url을 받지 못했습니다.');
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const glbPath = path.join(OUTPUT_DIR, `meshy-animated-${timestamp}.glb`);
  const metaPath = path.join(OUTPUT_DIR, `meshy-animated-${timestamp}.json`);

  console.log('9) 최종 GLB 다운로드');
  await downloadFile(glbUrl, glbPath);

  fs.writeFileSync(
    metaPath,
    JSON.stringify(
      {
        sampleImagePath: SAMPLE_IMAGE_PATH,
        imageTaskId,
        imageTask,
        remeshTaskId,
        remeshTask,
        rigTaskId,
        rigTask,
        animationTaskId,
        animationTask,
        downloadedGlbPath: glbPath
      },
      null,
      2
    ),
    'utf8'
  );

  console.log(`완료: ${glbPath}`);
  console.log(`메타데이터: ${metaPath}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
