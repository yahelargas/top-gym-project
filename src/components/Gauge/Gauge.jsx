import { useEffect, useRef } from "react";
import "./Gauge.css";

export default function Gauge({ value, max }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H * 0.78;   // נמוך יותר — מרכז הקשת
    const r  = W * 0.38;   // רדיוס מעט קטן יותר כדי לא לחתוך

    ctx.clearRect(0, 0, W, H);

    // Arc gradient track
    const grad = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
    grad.addColorStop(0,    "#27ae60");
    grad.addColorStop(0.50, "#f39c12");
    grad.addColorStop(1,    "#e74c3c");

    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, 0, false);
    ctx.strokeStyle = grad;
    ctx.lineWidth   = 18;
    ctx.lineCap     = "round";
    ctx.stroke();

    // Needle
    const ratio = Math.min(value / max, 1);
    const angle = Math.PI + ratio * Math.PI;
    const nx = cx + Math.cos(angle) * r * 0.82;
    const ny = cy + Math.sin(angle) * r * 0.82;

    ctx.save();
    ctx.shadowColor   = "rgba(0,0,0,0.18)";
    ctx.shadowBlur    = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(nx, ny);
    ctx.strokeStyle = "#1a1f2e";
    ctx.lineWidth   = 4;
    ctx.lineCap     = "round";
    ctx.stroke();
    ctx.restore();

    // Pivot circle
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fillStyle   = "#fff";
    ctx.fill();
    ctx.strokeStyle = "#1a1f2e";
    ctx.lineWidth   = 3;
    ctx.stroke();

    // Inner pivot dot
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#1a1f2e";
    ctx.fill();

    // End dots
    [[Math.PI, "#27ae60"], [0, "#e74c3c"]].forEach(([a, color]) => {
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 9, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });
  }, [value, max]);

  return (
    <canvas
      ref={canvasRef}
      className="gauge-canvas"
      width={680}
      height={400}
    />
  );
}
