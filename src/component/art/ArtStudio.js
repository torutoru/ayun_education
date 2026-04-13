import { useCallback, useEffect, useRef, useState } from 'react';
import { ANIMATION_OPTIONS } from '../../art/animationOptions';
import {
  createAnimation,
  createImage3d,
  createRemesh,
  createRigging,
  downloadStoredGlb,
  getAnimation,
  getImage3d,
  getRemesh,
  getRigging,
  storeArtJob
} from '../../art/artPipelineApi';
import ArtModelViewer from './ArtModelViewer';

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 600;
const POLL_INTERVAL_MS = 7000;
const MAX_POLL_ATTEMPTS = 80;

const COLORS = [
  '#f97316',
  '#facc15',
  '#22c55e',
  '#38bdf8',
  '#2563eb',
  '#ec4899',
  '#8b5cf6',
  '#111827',
  '#ffffff'
];

const BRUSH_SIZES = [8, 16, 28];

const ACTIVE_STATUSES = new Set([
  'uploading-image',
  'image3d-pending',
  'remesh-pending',
  'rigging-pending',
  'animation-pending',
  'downloading-glb'
]);

const PIPELINE_STEPS = [
  {
    key: 'upload',
    label: '그림 준비',
    statuses: ['uploading-image']
  },
  {
    key: 'image3d',
    label: '3D 변환',
    statuses: ['image3d-pending', 'image3d-succeeded']
  },
  {
    key: 'remesh',
    label: '리메시',
    statuses: ['remesh-pending', 'remesh-succeeded']
  },
  {
    key: 'rigging',
    label: '리깅',
    statuses: ['rigging-pending', 'rigging-succeeded']
  },
  {
    key: 'animation',
    label: '애니메이션',
    statuses: ['animation-pending', 'animation-succeeded']
  },
  {
    key: 'save',
    label: '기기 저장',
    statuses: ['downloading-glb', 'ready']
  }
];

function getCanvasPoint(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  };
}

function sortJobs(jobs) {
  return [...jobs].sort((left, right) => right.updatedAt - left.updatedAt);
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('이미지 변환에 실패했어요.'));
    reader.readAsDataURL(blob);
  });
}

function canvasToBlob(canvas, quality = 0.92) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('그림을 JPG로 만들지 못했어요.'));
          return;
        }

        resolve(blob);
      },
      'image/jpeg',
      quality
    );
  });
}

function canvasHasInk(canvas) {
  const context = canvas.getContext('2d');
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);

  for (let index = 3; index < data.length; index += 4) {
    if (data[index] > 0) {
      return true;
    }
  }

  return false;
}

function createJobId() {
  return `art-job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getStatusCopy(status) {
  switch (status) {
    case 'uploading-image':
      return '그림을 3D 작업용으로 준비하는 중';
    case 'image3d-pending':
      return 'Meshy에서 3D 모델을 만드는 중';
    case 'image3d-succeeded':
      return '3D 모델 생성 완료';
    case 'remesh-pending':
      return '리깅 전에 모델을 가볍게 정리하는 중';
    case 'remesh-succeeded':
      return '리메시 완료';
    case 'rigging-pending':
      return '캐릭터에 뼈대를 넣는 중';
    case 'rigging-succeeded':
      return '리깅 완료';
    case 'animation-pending':
      return '움직임을 입히는 중';
    case 'animation-succeeded':
      return '애니메이션 적용 완료';
    case 'downloading-glb':
      return '완성된 파일을 Cloudflare R2에 저장하는 중';
    case 'ready':
      return '메타데이터와 파일 저장이 끝났어요';
    case 'failed':
      return '작업이 중간에 멈췄어요';
    default:
      return '그림을 준비해 주세요';
  }
}

function getResultCopy(job) {
  if (!job) {
    return {
      title: '결과를 기다리는 중',
      description: '작업을 시작하면 여기에서 결과를 알려 줄게요.'
    };
  }

  if (job.status === 'failed') {
    return {
      title: '작업이 중간에 멈췄어요',
      description: job.errorMessage || '잠시 후 다시 시도해 주세요.'
    };
  }

  if (job.status === 'ready') {
    return {
      title: '저장까지 끝났어요',
      description: '이제 3D 보기 버튼으로 저장된 파일을 다시 열 수 있어요.'
    };
  }

  return {
    title: '결과를 만드는 중',
    description: '3D 캐릭터가 완성되면 여기에서 결과를 보여 줄게요.'
  };
}

function getPipelineStepState(job, stepIndex) {
  const effectiveStatus =
    job.status === 'failed'
      ? job.failedFromStatus || 'uploading-image'
      : job.status;
  const currentIndex = PIPELINE_STEPS.findIndex((step) => step.statuses.includes(effectiveStatus));

  if (effectiveStatus === 'ready' && stepIndex === PIPELINE_STEPS.length - 1) {
    return 'done';
  }

  if (currentIndex === -1) {
    return 'todo';
  }

  if (stepIndex < currentIndex) {
    return 'done';
  }

  if (stepIndex === currentIndex) {
    if (effectiveStatus === 'ready') {
      return 'done';
    }

    if (job.status === 'failed') {
      return 'stopped';
    }

    if (effectiveStatus.endsWith('succeeded')) {
      return 'done';
    }

    return 'current';
  }

  return 'todo';
}

function getPipelineStepProgress(job, step) {
  if (!job || !step.statuses.includes(job.status)) {
    return '';
  }

  if (typeof job.progress !== 'number') {
    return '';
  }

  const bounded = Math.max(0, Math.min(100, Math.round(job.progress)));
  return ` (${bounded}%)`;
}

function ArtStudio() {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const runningJobsRef = useRef(new Set());
  const [activeColor, setActiveColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1]);
  const [tool, setTool] = useState('draw');
  const [selectedActionId, setSelectedActionId] = useState(ANIMATION_OPTIONS[0].id);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('사람 모양 캐릭터를 크게 그리면 3D 애니메이션으로 만들기 쉬워요.');
  const [isPipelineDialogOpen, setIsPipelineDialogOpen] = useState(false);
  const [isViewerDialogOpen, setIsViewerDialogOpen] = useState(false);
  const [selectedModelBlob, setSelectedModelBlob] = useState(null);

  const selectedJob = jobs.find((job) => job.id === selectedJobId) || null;
  const isAnyJobRunning = jobs.some((job) => ACTIVE_STATUSES.has(job.status));

  const upsertJob = useCallback(async (nextJob) => {
    setJobs((prevJobs) => sortJobs([...prevJobs.filter((job) => job.id !== nextJob.id), nextJob]));
    return nextJob;
  }, []);

  const mergeJob = useCallback(
    async (job, updates) => {
      const nextJob = {
        ...job,
        ...updates,
        updatedAt: Date.now()
      };

      return upsertJob(nextJob);
    },
    [upsertJob]
  );

  const waitForTask = useCallback(
    async (job, taskId, loader, pendingStatus) => {
      let currentJob = job;

      for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
        const task = await loader(taskId);
        const status = task.status;

        currentJob = await mergeJob(currentJob, {
          status: pendingStatus,
          progress: typeof task.progress === 'number' ? task.progress : currentJob.progress,
          stageMessage: getStatusCopy(pendingStatus)
        });

        if (status === 'SUCCEEDED') {
          return {
            job: currentJob,
            task
          };
        }

        if (status === 'FAILED' || status === 'CANCELED' || status === 'EXPIRED') {
          throw new Error(task.task_error?.message || 'Meshy 작업이 실패했어요.');
        }

        await wait(POLL_INTERVAL_MS);
      }

      throw new Error('Meshy 작업 확인 시간이 너무 오래 걸리고 있어요. 잠시 후 다시 확인해 주세요.');
    },
    [mergeJob]
  );

  const resumePipeline = useCallback(
    async (job, sourceBlob) => {
      if (runningJobsRef.current.has(job.id)) {
        return;
      }

      if (!sourceBlob) {
        throw new Error('원본 그림을 다시 받아야 해서 새로 3D 생성을 시작해 주세요.');
      }

      runningJobsRef.current.add(job.id);
      let currentJob = job;

      try {
        if (!currentJob.image3dTaskId) {
          setFeedbackMessage('그림을 Meshy 이미지-투-3D 단계로 보내고 있어요.');
          currentJob = await mergeJob(currentJob, {
            status: 'uploading-image',
            stageMessage: getStatusCopy('uploading-image')
          });

          const imageDataUrl = await blobToDataUrl(sourceBlob);
          const image3dStart = await createImage3d(imageDataUrl);
          currentJob = await mergeJob(currentJob, {
            image3dTaskId: image3dStart.taskId,
            status: 'image3d-pending',
            stageMessage: getStatusCopy('image3d-pending')
          });
        }

        if (!currentJob.remeshTaskId) {
          const imageTaskResult = await waitForTask(currentJob, currentJob.image3dTaskId, getImage3d, 'image3d-pending');
          currentJob = await mergeJob(imageTaskResult.job, {
            status: 'image3d-succeeded',
            image3dGlbUrl: imageTaskResult.task.model_urls?.glb || '',
            image3dPreviewUrl: imageTaskResult.task.thumbnail_url || currentJob.sourcePreviewUrl,
            image3dExpiresAt: imageTaskResult.task.expires_at || null,
            stageMessage: getStatusCopy('image3d-succeeded')
          });

          setFeedbackMessage('리깅 전에 모델을 가볍게 정리하고 있어요.');
          const remeshStart = await createRemesh(currentJob.image3dTaskId);
          currentJob = await mergeJob(currentJob, {
            remeshTaskId: remeshStart.taskId,
            status: 'remesh-pending',
            stageMessage: getStatusCopy('remesh-pending')
          });
        }

        if (!currentJob.riggingTaskId) {
          const remeshTaskResult = await waitForTask(currentJob, currentJob.remeshTaskId, getRemesh, 'remesh-pending');
          currentJob = await mergeJob(remeshTaskResult.job, {
            status: 'remesh-succeeded',
            remeshGlbUrl: remeshTaskResult.task.model_urls?.glb || '',
            stageMessage: getStatusCopy('remesh-succeeded')
          });

          setFeedbackMessage('리메시가 끝나서 이제 캐릭터에 뼈대를 넣어요.');
          const riggingStart = await createRigging(currentJob.remeshTaskId);
          currentJob = await mergeJob(currentJob, {
            riggingTaskId: riggingStart.taskId,
            status: 'rigging-pending',
            stageMessage: getStatusCopy('rigging-pending')
          });
        }

        if (!currentJob.animationTaskId) {
          const rigTaskResult = await waitForTask(currentJob, currentJob.riggingTaskId, getRigging, 'rigging-pending');
          currentJob = await mergeJob(rigTaskResult.job, {
            status: 'rigging-succeeded',
            riggedGlbUrl: rigTaskResult.task.rigged_character_glb_url || '',
            rigPreviewUrl: rigTaskResult.task.thumbnail_url || currentJob.image3dPreviewUrl,
            stageMessage: getStatusCopy('rigging-succeeded')
          });

          setFeedbackMessage('이제 캐릭터에 움직임을 입히고 있어요.');
          const animationStart = await createAnimation(currentJob.riggingTaskId, currentJob.actionId);
          currentJob = await mergeJob(currentJob, {
            animationTaskId: animationStart.taskId,
            status: 'animation-pending',
            stageMessage: getStatusCopy('animation-pending')
          });
        }

        if (!currentJob.remoteJobId) {
          const animationTaskResult = await waitForTask(currentJob, currentJob.animationTaskId, getAnimation, 'animation-pending');
          const animationResult = animationTaskResult.task.result || {};
          currentJob = await mergeJob(animationTaskResult.job, {
            status: 'animation-succeeded',
            finalGlbUrl: animationTaskResult.task.animation_glb_url || animationResult.animation_glb_url || '',
            finalExpiresAt: animationTaskResult.task.expires_at || null,
            stageMessage: getStatusCopy('animation-succeeded')
          });

          if (!currentJob.finalGlbUrl) {
            throw new Error('최종 애니메이션 GLB 주소를 받지 못했어요.');
          }

          setFeedbackMessage('완성된 파일을 Cloudflare R2와 Firestore에 저장하고 있어요.');
          currentJob = await mergeJob(currentJob, {
            status: 'downloading-glb',
            stageMessage: getStatusCopy('downloading-glb')
          });

          const remoteStored = await storeArtJob({
            jobId: currentJob.id,
            actionId: currentJob.actionId,
            actionLabel: currentJob.actionLabel,
            createdAt: currentJob.createdAt,
            sourcePreviewDataUrl: currentJob.sourcePreviewUrl,
            finalGlbUrl: currentJob.finalGlbUrl,
            finalExpiresAt: currentJob.finalExpiresAt
          });

          currentJob = await mergeJob(currentJob, {
            remoteJobId: remoteStored.jobId || currentJob.id,
            status: 'ready',
            progress: 100,
            stageMessage: getStatusCopy('ready')
          });
        }

        setSelectedJobId(currentJob.id);
        setFeedbackMessage('완성된 캐릭터를 저장했어요. 다시 볼 수 있어요.');
      } catch (error) {
        const failedJob = await mergeJob(currentJob, {
          status: 'failed',
          failedFromStatus: currentJob.status,
          errorMessage: error.message,
          stageMessage: getStatusCopy('failed')
        });
        setSelectedJobId(failedJob.id);
        setFeedbackMessage(error.message);
      } finally {
        runningJobsRef.current.delete(job.id);
      }
    },
    [mergeJob, waitForTask]
  );

  useEffect(() => {
    let mounted = true;

    const loadModelBlob = async () => {
      if (!selectedJob?.remoteJobId || !isViewerDialogOpen) {
        if (mounted) {
          setSelectedModelBlob(null);
        }
        return;
      }

      const blob = await downloadStoredGlb(selectedJob.remoteJobId);

      if (mounted) {
        setSelectedModelBlob(blob);
      }
    };

    loadModelBlob().catch(() => {
      if (mounted) {
        setSelectedModelBlob(null);
      }
    });

    return () => {
      mounted = false;
    };
  }, [isViewerDialogOpen, selectedJob]);

  const startPipeline = async () => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    if (!canvasHasInk(canvas)) {
      setFeedbackMessage('먼저 사람처럼 보이는 캐릭터를 크게 그려 주세요.');
      return;
    }

    const sourceBlob = await canvasToBlob(canvas);
    const previewUrl = canvas.toDataURL('image/jpeg', 0.72);
    const job = await upsertJob({
      id: createJobId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      actionId: selectedActionId,
      actionLabel: ANIMATION_OPTIONS.find((option) => option.id === selectedActionId)?.label || '기본 애니메이션',
      sourcePreviewUrl: previewUrl,
      status: 'uploading-image',
      progress: 0,
      stageMessage: getStatusCopy('uploading-image'),
      errorMessage: ''
    });

    setSelectedJobId(job.id);
    setIsPipelineDialogOpen(true);
    setFeedbackMessage('새 캐릭터 작업을 시작했어요.');
    resumePipeline(job, sourceBlob);
  };

  const startStroke = (event) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    const { x, y } = getCanvasPoint(event, canvas);

    isDrawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = brushSize;
    context.strokeStyle = activeColor;
    context.globalCompositeOperation = tool === 'erase' ? 'destination-out' : 'source-over';
    context.beginPath();
    context.moveTo(x, y);
  };

  const moveStroke = (event) => {
    if (!isDrawingRef.current) {
      return;
    }

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    const { x, y } = getCanvasPoint(event, canvas);

    context.lineTo(x, y);
    context.stroke();
  };

  const endStroke = (event) => {
    if (!isDrawingRef.current) {
      return;
    }

    isDrawingRef.current = false;
    canvasRef.current?.releasePointerCapture(event.pointerId);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    canvas.getContext('2d').clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    setFeedbackMessage('도화지를 비웠어요. 새로운 캐릭터를 그려 보세요.');
  };

  const resultCopy = getResultCopy(selectedJob);

  return (
    <section className="art-studio-layout">
      <div className="detail-card art-board-card">
        <div className="art-board-header">
          <span className="eyebrow">CANVAS</span>
          <div className="art-status-chip">{feedbackMessage}</div>
        </div>

        <div className="art-toolbar">
          <div className="art-toolbar-group">
            <button
              type="button"
              className={tool === 'draw' ? 'art-icon-button active' : 'art-icon-button'}
              onClick={() => setTool('draw')}
              aria-label="연필"
              title="연필"
            >
              ✏
            </button>
            <button
              type="button"
              className={tool === 'erase' ? 'art-icon-button active' : 'art-icon-button'}
              onClick={() => setTool('erase')}
              aria-label="지우개"
              title="지우개"
            >
              ⌫
            </button>
          </div>

          <div className="art-toolbar-divider" />

          <div className="art-toolbar-group art-color-toolbar">
            {COLORS.map((color) => (
              <button
                type="button"
                key={color}
                className={activeColor === color ? 'art-color-swatch active' : 'art-color-swatch'}
                style={{ backgroundColor: color }}
                onClick={() => setActiveColor(color)}
                aria-label={`색상 ${color}`}
                title={color}
              />
            ))}
          </div>

          <div className="art-toolbar-divider" />

          <div className="art-toolbar-group">
            {BRUSH_SIZES.map((size) => (
              <button
                type="button"
                key={size}
                className={brushSize === size ? 'art-size-button active' : 'art-size-button'}
                onClick={() => setBrushSize(size)}
                aria-label={`붓 굵기 ${size}`}
                title={`${size}px`}
              >
                <span className={`art-size-dot size-${size}`} />
              </button>
            ))}
          </div>

          <div className="art-toolbar-divider" />

          <div className="art-toolbar-group">
            <button
              type="button"
              className="art-icon-button clear"
              onClick={clearCanvas}
              aria-label="도화지 비우기"
              title="도화지 비우기"
            >
              ↺
            </button>
          </div>
        </div>

        <div className="art-board-wrap plain-canvas">
          <canvas
            ref={canvasRef}
            className="art-canvas art-paint-canvas"
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onPointerDown={startStroke}
            onPointerMove={moveStroke}
            onPointerUp={endStroke}
            onPointerLeave={endStroke}
            onPointerCancel={endStroke}
          />
        </div>

        <div className="art-pipeline-bar">
          <div className="art-action-picker">
            {ANIMATION_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.id}
                className={selectedActionId === option.id ? 'art-action-chip active' : 'art-action-chip'}
                onClick={() => setSelectedActionId(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="submenu-button sun art-generate-button"
            onClick={startPipeline}
            disabled={isAnyJobRunning}
          >
            3D 캐릭터 만들기
          </button>
        </div>
      </div>

      {isPipelineDialogOpen && selectedJob ? (
        <div className="art-pipeline-dialog-backdrop" role="dialog" aria-modal="true">
          <div className="art-pipeline-dialog">
            <div className="art-pipeline-dialog-header">
              <div>
                <span className="eyebrow">WORK STATUS</span>
                <h2>3D 캐릭터 만드는 중</h2>
              </div>
              <button
                type="button"
                className="art-dialog-close"
                onClick={() => setIsPipelineDialogOpen(false)}
                aria-label="작업창 닫기"
              >
                ×
              </button>
            </div>

            <div className="art-pipeline-dialog-preview">
              {selectedJob.sourcePreviewUrl ? (
                <img src={selectedJob.sourcePreviewUrl} alt="pipeline preview" />
              ) : null}
            </div>

            <div className="art-pipeline-step-line" aria-label="3D 모델링 진행 상태">
              {PIPELINE_STEPS.map((step, index) => {
                const stepState = getPipelineStepState(selectedJob, index);

                return (
                  <div key={step.key} className="art-pipeline-step-inline-wrap">
                    <div className={`art-pipeline-step-inline ${stepState}`}>
                      <span>{`${step.label}${getPipelineStepProgress(selectedJob, step)}`}</span>
                    </div>
                    {index < PIPELINE_STEPS.length - 1 ? (
                      <span className="art-pipeline-step-arrow" aria-hidden="true">
                        &gt;
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="art-pipeline-dialog-result">
              <strong>{resultCopy.title}</strong>
              <p>{resultCopy.description}</p>
              {selectedJob.status === 'ready' ? (
                <button
                  type="button"
                  className="submenu-button sun art-result-button"
                  onClick={() => setIsViewerDialogOpen(true)}
                >
                  3D 보기
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {isViewerDialogOpen && selectedJob ? (
        <div className="art-pipeline-dialog-backdrop" role="dialog" aria-modal="true">
          <div className="art-pipeline-dialog art-viewer-dialog">
            <div className="art-pipeline-dialog-header">
              <div>
                <span className="eyebrow">3D VIEW</span>
                <h2>{selectedJob.actionLabel}</h2>
              </div>
              <button
                type="button"
                className="art-dialog-close"
                onClick={() => setIsViewerDialogOpen(false)}
                aria-label="3D 보기 닫기"
              >
                ×
              </button>
            </div>

            {selectedModelBlob ? (
              <ArtModelViewer blob={selectedModelBlob} />
            ) : (
              <div className="art-viewer-placeholder">저장된 3D 모델을 불러오는 중이에요.</div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default ArtStudio;
