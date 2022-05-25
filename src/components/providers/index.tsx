import React, { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./auth";
import { QueryClientProvider, QueryClient } from "react-query";
import StyleProvider from "./style";

const AppProvider = ({ children }: { children: ReactNode }) => {
	const queryClient = new QueryClient();

	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<StyleProvider>{children}</StyleProvider>
				<Toaster containerStyle={{ fontSize: "1.5rem" }} />
			</AuthProvider>
		</QueryClientProvider>
	);
};

export default AppProvider;
