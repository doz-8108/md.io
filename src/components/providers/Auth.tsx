import React, {
	createContext,
	ReactNode,
	useEffect,
	useState,
	useContext
} from "react";
import { User } from "firebase/auth";
import { useQueryClient } from "react-query";

import * as auth from "../../utils/auth";
import Spinner from "components/Spinner";

const AuthContext = createContext<
	| {
			user: User | null | undefined;
			login: () => Promise<void>;
			logout: () => Promise<void>;
	  }
	| undefined
>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null | undefined>(undefined);
	const [isLoading, setLoading] = useState(false);
	const queryClient = useQueryClient();

	const authenticateUser = () => auth.retrieveCurrentUser(setUser, setLoading);
	const login = () => auth.login().then(authenticateUser);
	const logout = () =>
		auth.logout().then(() => {
			queryClient.clear();
			window.location.reload();
			localStorage.clear();
		});

	useEffect(() => {
		setLoading(true);
		authenticateUser();
	}, []);

	if (isLoading) {
		return <Spinner />;
	}

	return (
		<AuthContext.Provider value={{ user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("No auth context is available!");
	return ctx;
};
