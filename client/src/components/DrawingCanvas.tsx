import { useRef, useEffect, useState, useCallback } from 'react';
import { Undo2 } from 'lucide-react';
import type { DrawingStroke } from '@/lib/drawingGameStore';

interface DrawingCanvasProps {
  isDrawing: boolean;
  strokes: DrawingStroke[];
  onStroke: (stroke: DrawingStroke) => void;
  onUndo?: () => void;
}

const COLORS = ['#000000', '#ff0000', '#0066ff', '#00aa00', '#ff8800', '#9900cc', '#ffffff'];
const WIDTHS = [2, 4, 8, 14];

export function DrawingCanvas({ isDrawing, strokes, onStroke, onUndo }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState('#000000');
  const [width, setWidth] = useState(4);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const isDrawingRef = useRef(false);
  const currentPoints = useRef<{ x: number; y: number }[]>([]);
  const lastStrokeCount = useRef(0);

  // Canvas size
  const [canvasSize, setCanvasSize] = useState({ w: 400, h: 400 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        setCanvasSize({ w, h: w }); // square canvas
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Redraw strokes when array changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If strokes were removed (undo), do a full redraw
    if (strokes.length < lastStrokeCount.current) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < strokes.length; i++) {
        drawStroke(ctx, strokes[i], canvas.width, canvas.height);
      }
    } else {
      // Only draw new strokes (optimization)
      if (lastStrokeCount.current === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      for (let i = lastStrokeCount.current; i < strokes.length; i++) {
        drawStroke(ctx, strokes[i], canvas.width, canvas.height);
      }
    }
    lastStrokeCount.current = strokes.length;
  }, [strokes, canvasSize]);

  // Full redraw when canvas size changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    lastStrokeCount.current = 0;

    for (let i = 0; i < strokes.length; i++) {
      drawStroke(ctx, strokes[i], canvas.width, canvas.height);
    }
    lastStrokeCount.current = strokes.length;
  }, [canvasSize.w, canvasSize.h]);

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: DrawingStroke, w: number, h: number) => {
    if (stroke.points.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = stroke.tool === 'eraser' ? '#ffffff' : stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const pts = stroke.points;
    ctx.moveTo(pts[0].x * w, pts[0].y * h);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x * w, pts[i].y * h);
    }
    ctx.stroke();
  };

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    };
  }, []);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    isDrawingRef.current = true;
    const pos = getPos(e);
    currentPoints.current = [pos];

    // Draw dot immediately for visual feedback
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.fillStyle = tool === 'eraser' ? '#ffffff' : color;
        ctx.arc(pos.x * canvas.width, pos.y * canvas.height, width / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [isDrawing, getPos, color, width, tool]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isDrawingRef.current) return;
    e.preventDefault();
    const pos = getPos(e);
    currentPoints.current.push(pos);

    // Draw live on canvas
    const canvas = canvasRef.current;
    if (canvas && currentPoints.current.length >= 2) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const pts = currentPoints.current;
        const prev = pts[pts.length - 2];
        const curr = pts[pts.length - 1];
        ctx.beginPath();
        ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(prev.x * canvas.width, prev.y * canvas.height);
        ctx.lineTo(curr.x * canvas.width, curr.y * canvas.height);
        ctx.stroke();
      }
    }
  }, [isDrawing, getPos, color, width, tool]);

  const handleEnd = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (currentPoints.current.length >= 2) {
      const stroke: DrawingStroke = {
        points: [...currentPoints.current],
        color,
        width,
        tool,
      };
      onStroke(stroke);
    }
    currentPoints.current = [];
  }, [color, width, tool, onStroke]);

  return (
    <div ref={containerRef} className="w-full">
      {/* Toolbar (only when drawing) */}
      {isDrawing && (
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {/* Colors */}
          <div className="flex gap-1">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => { setColor(c); setTool('pen'); }}
                className={`w-7 h-7 rounded-full border-2 transition-all ${
                  color === c && tool === 'pen' ? 'border-white scale-110' : 'border-slate-600'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-slate-600 mx-1"></div>

          {/* Widths */}
          <div className="flex gap-1 items-center">
            {WIDTHS.map(w => (
              <button
                key={w}
                onClick={() => setWidth(w)}
                className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                  width === w ? 'bg-slate-600' : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                <div className="rounded-full bg-white" style={{ width: w + 2, height: w + 2 }} />
              </button>
            ))}
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-slate-600 mx-1"></div>

          {/* Eraser */}
          <button
            onClick={() => setTool(tool === 'eraser' ? 'pen' : 'eraser')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              tool === 'eraser' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Borracha
          </button>

          {/* Undo */}
          {onUndo && (
            <button
              onClick={onUndo}
              className="px-3 py-1 rounded-lg text-xs font-bold transition-all bg-slate-800 text-slate-400 hover:bg-slate-700 flex items-center gap-1"
              title="Desfazer"
            >
              <Undo2 className="w-3.5 h-3.5" />
              Desfazer
            </button>
          )}
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={canvasSize.w}
        height={canvasSize.h}
        className="w-full rounded-2xl border-2 border-slate-600 bg-white cursor-crosshair touch-none"
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />
    </div>
  );
}
