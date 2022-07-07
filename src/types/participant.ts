import { Cursor } from "./cursor";

export interface Participant {
	name: string;
	uid: string;
	avatarURL?: string;
	pos?: Cursor;
}
