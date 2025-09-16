
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type Scale = "linear" | "log";

export type ImageKnobProps = {
  /** WebKnobMan strip: N square frames stacked vertically */
  src: string;
  frames: number;          // e.g. 101
  diameter: number;        // px, width & height of a single frame
  /** Value domain */
  value: number;
  min: number;
  max: number;
  /** Scaling of the value domain */
  scale?: Scale;           // default "linear". For "log", min must be > 0
  /** Optional discrete step in *value* units (linear or log). If omitted, knob moves smoothly. */
  step?: number;
  /** Called whenever value changes (during drag/keys/wheel) */
  onChange: (v: number) => void;

  /** Optional accessibility/UX niceties */
  label?: string;
  format?: (v: number) => string; // readout text
  disabled?: boolean;
  tooltipOffsetX?: number; // default: diameter + 12 (to the right of knob)
  tooltipOffsetY?: number; // default: diameter * 0.25 (a bit below top)  
};

/** Utility */
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/** map value->t in [0..1] and inverse, supporting linear/log */
function makeMapper(min: number, max: number, scale: Scale) {
  if (scale === "log") {
    if (!(min > 0)) throw new Error("ImageKnob(log): min must be > 0");
    const k = Math.log(max / min);
    const to01 = (v: number) => clamp(Math.log(v / min) / k, 0, 1);
    const from01 = (t: number) => min * Math.exp(clamp(t, 0, 1) * k);
    return { to01, from01 };
  } else {
    const span = max - min;
    const to01 = (v: number) => clamp((v - min) / span, 0, 1);
    const from01 = (t: number) => min + clamp(t, 0, 1) * span;
    return { to01, from01 };
  }
}

/**
 * Sprite-based knob (WebKnobMan strip) with native linear/log scaling.
 * Pointer, keyboard, and wheel interactions. Accessible as a slider.
 */
export default function ImageKnob({
  src,
  frames,
  diameter,
  value,
  min,
  max,
  scale = "linear",
  step,
  onChange,
  label,
  format,
  disabled = false,
  tooltipOffsetX,
  tooltipOffsetY
}: ImageKnobProps) {
  const { to01, from01 } = useMemo(() => makeMapper(min, max, scale), [min, max, scale]);

  // work in the *t-domain* (0..1) for a uniform drag feel across linear/log
  const t = to01(value);

  // map t -> sprite frame
  const frameIdx = Math.round(t * (frames - 1));
  const offsetY = -frameIdx * diameter;

  // drag state
  const dragging = useRef(false);
  const lastY = useRef<number | null>(null);

  // how fast the knob turns: tDelta per pixel
  // feel free to tweak; smaller = finer control
  const tSensitivity = 1 / 180; // ~180px for full sweep


  // ---- Tooltip state ----
  const [tipOpen, setTipOpen] = useState(false);
  const [tipText, setTipText] = useState("");
  const tipTimer = useRef<number | null>(null);

  const tipX = tooltipOffsetX ?? diameter + 12;
  const tipY = tooltipOffsetY ?? Math.round(diameter * 0.25);

  const showTooltip = useCallback(
    (v: number) => {
      setTipText(format ? format(v) : `${Math.round(v * 1000) / 1000}`);
      setTipOpen(true);
      // hide after inactivity
      if (tipTimer.current) window.clearTimeout(tipTimer.current);
      tipTimer.current = window.setTimeout(() => setTipOpen(false), 700); // hide ~0.7s after last change
    },
    [format]
  );

  useEffect(() => {
    return () => {
      if (tipTimer.current) window.clearTimeout(tipTimer.current);
    };
  }, []);

  const commitT = useCallback(
    (tNew: number) => {
      let v = from01(tNew);
      if (step != null && step > 0) {
        // snap in the *value* domain
        v = Math.round(v / step) * step;
      }
      onChange(clamp(v, min, max));
      showTooltip(v);
    },
    [from01, step, onChange, min, max]
  );

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    dragging.current = true;
    lastY.current = e.clientY;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragging.current || lastY.current == null) return;
    const dy = lastY.current - e.clientY; // up -> positive
    lastY.current = e.clientY;
    const tNew = clamp(t + dy * tSensitivity, 0, 1);
    commitT(tNew);
  };

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = () => {
    dragging.current = false;
    lastY.current = null;
  };

  const onWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    // deltaY > 0 => scroll down => decrease
    const tNew = clamp(t - Math.sign(e.deltaY) * 0.02, 0, 1);
    commitT(tNew);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    // If a step is given, use it in the value domain; otherwise nudge t.
    const bigT = 0.1, smallT = 0.02;
    const applyValueStep = (dir: number, mul = 1) => {
      if (step && step > 0) {
        onChange(clamp(value + dir * mul * step, min, max));
      } else {
        const tNew = clamp(t + dir * mul * smallT, 0, 1);
        commitT(tNew);
      }
    };

    switch (e.key) {
      case "ArrowLeft":
      case "ArrowDown":
        applyValueStep(-1);
        e.preventDefault();
        break;
      case "ArrowRight":
      case "ArrowUp":
        applyValueStep(+1);
        e.preventDefault();
        break;
      case "PageDown":
        applyValueStep(-1, 5);
        e.preventDefault();
        break;
      case "PageUp":
        applyValueStep(+1, 5);
        e.preventDefault();
        break;
      case "Home":
        commitT(0);
        e.preventDefault();
        break;
      case "End":
        commitT(1);
        e.preventDefault();
        break;
      default:
        break;
    }
  };

  const ariaNow = Math.round(value * 1000) / 1000;

  return (
    <div style={{ 
        width: diameter, // give room for tooltip to the right
        height: diameter + (label ? 24 : 0), // room for label below
        position: "relative",
        userSelect: "none",
        opacity: disabled ? 0.3 : 1,
        textAlign: "left",      
    }}>

      <div
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={ariaNow}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={onWheel}
        style={{
          width: diameter,
          height: diameter,
          overflow: "hidden",
          cursor: "ns-resize",
          backgroundImage: `url(${src})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: `0px ${offsetY}px`,
          backgroundSize: `${diameter}px ${diameter * frames}px`,
          borderRadius: "50%",
          outline: "none",
          display: "inline-block"
        }}
      
      />

       {/* Tooltip (shows during interaction) */}
       {tipOpen && (
        <div
          style={{
            position: "absolute",
            left: tipX,
            top: tipY,
            transform: "translateY(-50%)",
            padding: "4px 8px",
            fontSize: 12,
            borderRadius: 6,
            background: "rgba(20,20,20,0.95)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
            pointerEvents: "none",
            zIndex: 2,
            whiteSpace: "nowrap",
          }}
        >
          {tipText}
        </div>
      )}      

      {label && (
        <div
          style={{
            marginTop: 6,
            width: diameter,            // anchor to knob
            display: "flex",            // center the content, not just text
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontSize: 12,
              opacity: 0.85,
              whiteSpace: "nowrap",     // keep it one line; remove if you want wrapping
            }}
          >
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

