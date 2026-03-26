import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

const CANVAS_WIDTH = 860;
const CANVAS_HEIGHT = 520;

function getPoint(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  };
}

const AlphabetDrawingCanvas = forwardRef(function AlphabetDrawingCanvas(
  { targetLetter, disabled = false, onInkChange },
  ref
) {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const hasInkRef = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  const markInk = useCallback(
    (nextValue) => {
      hasInkRef.current = nextValue;
      setHasInk(nextValue);
      onInkChange?.(nextValue);
    },
    [onInkChange]
  );

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = '#18364f';
    context.lineWidth = 28;
    markInk(false);
  }, [markInk]);

  useImperativeHandle(
    ref,
    () => ({
      clear: clearCanvas,
      getCanvas: () => canvasRef.current,
      hasInk: () => hasInkRef.current
    }),
    [clearCanvas]
  );

  useEffect(() => {
    clearCanvas();
  }, [clearCanvas]);

  useEffect(() => {
    clearCanvas();
  }, [targetLetter, clearCanvas]);

  const handlePointerDown = (event) => {
    if (disabled) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const point = getPoint(event, canvas);

    isDrawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(point.x, point.y);
    context.lineTo(point.x + 0.1, point.y + 0.1);
    context.stroke();
    markInk(true);
  };

  const handlePointerMove = (event) => {
    if (!isDrawingRef.current || disabled) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const point = getPoint(event, canvas);

    context.lineTo(point.x, point.y);
    context.stroke();
  };

  const handlePointerUp = (event) => {
    if (!isDrawingRef.current) {
      return;
    }

    isDrawingRef.current = false;
    const canvas = canvasRef.current;

    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className="alphabet-canvas-wrap">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="alphabet-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      <div className="alphabet-canvas-guide" aria-hidden="true">
        <span>{targetLetter}</span>
      </div>
      {!hasInk ? <div className="alphabet-canvas-hint">Draw the letter on the board.</div> : null}
    </div>
  );
});

export default AlphabetDrawingCanvas;
