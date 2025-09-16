import { Box } from "@mui/material";

export function DialogContent(props: {children: React.ReactNode}) {
  return (
    <Box sx={{
      margin: "4px",
      padding: "10px 10px 10px 10px",
      fontSize: "110%"      
    }}>
      {props.children}
    </Box>
  );
}