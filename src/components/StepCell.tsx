  // Step style helper (mimics the provided jQuery/CSS logic)
// States:
// - base (not selected)
// - on (selected)
// - triggered (actively playing)

import { Box } from "@mui/material";

// Alternating beats: even beats (0-based) use alternate palette
function getStepStyle(evenBeat: boolean, active: boolean, triggered: boolean, disabled: boolean) {
    // Colors copied from your CSS spec
    const c = {
      base: "#282B32",
      on: "#7A8499",
      trig: "#3D424D",
      onTrig: "#CCDBFF",
      // even-beat variants
      baseEven: "#2C2933",
      onEven: "#847A99",
      trigEven: "#423D4D",
      onTrigEven: "#DCCDFF",
    } as const;
  
    let backgroundColor: string = c.base;
    let boxShadow: string = "0 1px 2px rgba(0, 0, 0, .9), 0 0 1px 1px rgba(0, 0, 0, .8) inset";
  

    if (disabled) {
      if(active) {
        backgroundColor = "#555";
      }
      else {
        backgroundColor = "#333";
      }
      boxShadow = "0 1px 2px rgba(0, 0, 0, .5), 0 0 1px 1px rgba(0, 0, 0, .4) inset";
      return { backgroundColor, boxShadow };
    }

    if (evenBeat) {
      backgroundColor = c.baseEven;
      if (active && triggered) {
        backgroundColor = c.onTrigEven;
        boxShadow = "0 0 5px rgba(255, 255, 255, .5), 0 1px 3px rgba(0,0,0,.8), 0 0 1px rgba(0,0,0,.8) inset";
      } else if (triggered) {
        backgroundColor = c.trigEven;
      } else if (active) {
        backgroundColor = c.onEven;
        boxShadow = "0 1px 2px rgba(0,0,0,.9), 0 0 1px 1px #000 inset";
      }
    } else {
      backgroundColor = c.base;
      if (active && triggered) {
        backgroundColor = c.onTrig;
        boxShadow = "0 0 5px rgba(255, 255, 255, .5), 0 1px 3px rgba(0,0,0,.8), 0 0 1px rgba(0,0,0,.8) inset";
      } else if (triggered) {
        backgroundColor = c.trig;
      } else if (active) {
        backgroundColor = c.on;
        boxShadow = "0 1px 2px rgba(0,0,0,.9), 0 0 1px 1px #000 inset";
      }
    }
  
    return { backgroundColor, boxShadow };
  }
  
  // Step cell UI helper
  export const StepCell: React.FC<{ active: boolean; isNow: boolean; evenBeat?: boolean; disabled?: boolean; onClick: () => void }>
    = ({ active, isNow, evenBeat = false, onClick, disabled = false }) => {
      const { backgroundColor, boxShadow } = getStepStyle(evenBeat, active, isNow, disabled);
      return (
        <Box
          onClick={onClick}
          sx={{
            userSelect: "none",
            width: 15,
            height: 25,
            mx: "2px",
            borderRadius: "3px",
            lineHeight: "23px",
            textAlign: "center",
            backgroundColor,
            boxShadow,
            cursor: "pointer",
            transition: "all 25ms linear",
          }}
        />
      );
    };