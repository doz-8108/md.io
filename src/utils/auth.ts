import { initializeApp } from "firebase/app";
import {
	getAuth,
	signInWithPopup,
	GoogleAuthProvider,
	signOut,
	onAuthStateChanged,
	User
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
	apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
	authDomain: process.env.REACT_APP_FIREBASE_AUTHDOMAIN,
	projectId: process.env.REACT_APP_FIREBASE_PROJECTID,
	storageBucket: process.env.REACT_APP_FIREBASE_STORAGEBUCKET,
	messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGINGSENDERID,
	appId: process.env.REACT_APP_FIREBASE_APPID
};
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const provider = new GoogleAuthProvider();

export const db = getFirestore(app);
export const login = () => signInWithPopup(auth, provider).catch(err => {});
export const logout = () => signOut(auth);
export const retrieveCurrentUser = (
	setUser: (param: User | null) => void,
	setLoading: (param: boolean) => void
) => {
	onAuthStateChanged(auth, user => {
		setUser(user);
		setLoading(false);
	});
};
export const currentUser = () => auth.currentUser;
