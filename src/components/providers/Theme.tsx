import React, { ReactNode } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
	palette: {
		primary: {
			main: "#1089ff"
		},
		secondary: {
			main: "#ffcd32"
        }
	}
});

const StyleProvider = ({ children }: { children: ReactNode }) => {
	return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default StyleProvider;
