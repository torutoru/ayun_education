import { useRef, useState } from 'react';

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 600;

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

function getCanvasPoint(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  };
}

function ArtStudio() {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const [activeColor, setActiveColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1]);
  const [tool, setTool] = useState('draw');

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
  };

  return (
    <section className="art-studio-layout">
      <div className="detail-card art-board-card">
        <div className="art-board-header">
          <span className="eyebrow">CANVAS</span>
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
      </div>
    </section>
  );
}

export default ArtStudio;
