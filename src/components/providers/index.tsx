import React, { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { QueryClientProvider, QueryClient } from "react-query";

import StyleProvider from "./style";
import { CodeMirrorProvider } from "./code-mirror";
import { AuthProvider } from "./auth";

const AppProvider = ({ children }: { children: ReactNode }) => {
	const queryClient = new QueryClient();

	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<CodeMirrorProvider>
					<StyleProvider>{children}</StyleProvider>
					<Toaster containerStyle={{ fontSize: "1.5rem" }} />
				</CodeMirrorProvider>
			</AuthProvider>
		</QueryClientProvider>
	);
};

export default AppProvider;
