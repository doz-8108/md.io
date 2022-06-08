import { Participant } from "./participant";

export interface Project {
	id: string;
	owner: string;
	projectName: string;
	document: string;
	lastModified: Date;
	participants: Participant[];
}
