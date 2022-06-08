import { Cursor } from "./cusor";

export interface Participant {
	name: string;
	uid: string;
	avatarURL?: string;
	pos?: Cursor;
}
