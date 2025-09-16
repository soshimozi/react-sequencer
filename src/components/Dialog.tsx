import { Box } from "@mui/material";
import type { ReactNode } from "react";

type DialogProps = {
  open?: boolean; // not yet implemented
  children: ReactNode
}

export function Dialog({open = false, children}: DialogProps) {

  return(
    <>
      {open &&
        <Box sx={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "100vw",
          height: "100vh",
          zIndex: 998
        }}>
        <Box sx={{
          position: "fixed",
          top: "25%",
          zIndex: 999,
          left: "calc(50% - 450px / 2)",
          width: "450px",
          border: "3px solid #1d1f23",
          backgroundColor: "#282b32",
          boxShadow: " 0 0 2px 1px rgba(0, 0, 0, .8), 0 5px 25px 10px rgba(0, 0, 0, 0.25), 0 -1px 1px rgba(170, 184, 217, 0.15) inset"
        }}>{children}</Box>;
        </Box>
      }
    </>
  );
}