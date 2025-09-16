import React, { useState, useCallback, useRef } from "react";

type ImageSwitchProps = {
  src: string;         // sprite strip
  frameHeight: number; // height of one frame (px)
  frameWidth: number;       // width (px)
  value: boolean;      // current on/off
  onChange: (val: boolean) => void;
  label?: string;      // optional text below
  disabled?: boolean;
  format?: (v: boolean) => string; // readout text
  reversed?: boolean; // if true, first frame is "on"
  tooltipOffsetX?: number; // default: diameter + 12 (to the right of knob)
  tooltipOffsetY?: number; // default: diameter * 0.25 (a bit below top)  
};

export default function ImageSwitch({
  src,
  format,
  frameHeight,
  frameWidth,
  value,
  onChange,
  label,
  disabled,
  tooltipOffsetX,
  tooltipOffsetY,
  reversed = false,
}: ImageSwitchProps) {
  const [hover, setHover] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const [tipText, setTipText] = useState("");
  const tipTimer = useRef<number | null>(null);

  const tipX = tooltipOffsetX ?? frameWidth + 12;
  const tipY = tooltipOffsetY ?? Math.round(frameWidth * 0.25);

  const showTooltip = useCallback(
    (v: boolean) => {
      console.log('value: ', v);
      
      const text = format ? format(v) : `${v === true ? "On" : "Off"}`

      console.log('tooltip: ', text);
      setTipText(text);
      
      setTipOpen(true);

      // hide after inactivity
      if (tipTimer.current) window.clearTimeout(tipTimer.current);
      tipTimer.current = window.setTimeout(() => setTipOpen(false), 700); // hide ~0.7s after last change
    },
    [format]
  );  

  const handleToggle = useCallback(() => {
    if (disabled) return;
    showTooltip(!value);
    onChange(!value);
  }, [disabled, onChange, value]);

  const frameIndex = value ? reversed ? 0 : 1 : reversed ? 1 : 0;
  const bgPosY = -frameIndex * frameHeight;

  return (
    <div
      style={{
        position: "relative",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        userSelect: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div
        role="switch"
        aria-checked={value}
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            handleToggle();
          }
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: frameWidth,
          height: frameHeight,
          backgroundImage: `url(${src})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: `0px ${bgPosY}px`,
          outline: hover ? "1px solid #888" : "none",
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
            width: frameWidth,            // anchor to switch
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
