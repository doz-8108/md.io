import React from "react";
import "./App.css";
import AppProvider from "./components/providers";
import Entry from "./pages";

function App() {
	return (
		<AppProvider>
			<Entry />
		</AppProvider>
	);
}

export default App;
