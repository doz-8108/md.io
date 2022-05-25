import React, {
	createContext,
	ReactNode,
	useEffect,
	useState,
	useContext
} from "react";
import { User } from "firebase/auth";
import { CircularProgress } from "@mui/material";
import styled from "styled-components";
import { useQueryClient } from "react-query";

import * as auth from "../../utils/auth";

const AuthContext = createContext<
	| {
			user: User | null;
			login: () => Promise<void>;
			logout: () => Promise<void>;
	  }
	| undefined
>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setLoading] = useState(false);
	const queryClient = useQueryClient();

	const authenticateUser = () => auth.retrieveCurrentUser(setUser, setLoading);
	const login = () => auth.login().then(authenticateUser);
	const logout = () =>
		auth.logout().then(() => {
			queryClient.clear();
			window.location.reload();
		});

	useEffect(() => {
		setLoading(true);
		authenticateUser();
	}, []);

	if (isLoading) {
		return (
			<FullPageSpinner>
				<CircularProgress />
			</FullPageSpinner>
		);
	}

	return (
		<AuthContext.Provider value={{ user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

const FullPageSpinner = styled.div`
	display: flex;
	height: calc(100vh - 60px);
	justify-content: center;
	align-items: center;
`;

export const useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("No context is available!");

	return ctx;
};
