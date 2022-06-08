import React, { useCallback, useState } from "react";
import {
	collection,
	doc,
	getDocs,
	deleteDoc,
	updateDoc,
	documentId,
	where,
	query,
	getDoc,
	setDoc
} from "firebase/firestore";
import { v4 as uuidV4 } from "uuid";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router";

import { db } from "utils/auth";
import { useAuth } from "components/providers/auth";
import { pushErrorAlert } from "utils/alert";
import { Project } from "types/project";
import useStorage from "./useStorage";
import { Participant } from "types/participant";

type Participants = Participant[];

const useProject = () => {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const { deleteImages } = useStorage();
	const [members, setMembers] = useState<Participants>([]);

	const getProject = useCallback(async (id: string) => {
		const snapshot = await getDoc(doc(db, "projects", id));
		return snapshot.exists() ? snapshot.data() : undefined;
	}, []);

	const useCreateProject = () =>
		useMutation(
			async (projectName: string) => {
				const projectCollection = collection(db, "projects");
				const q = query(projectCollection, where("owner", "==", user?.uid));
				const projects = await getDocs(q);

				if (projects.docs.length >= 5)
					throw new Error("You can only create 5 projects!");

				const projectId = uuidV4();

				await setDoc(doc(db, "projects", projectId), {
					owner: user?.uid,
					projectName: encodeURIComponent(projectName),
					document: "## Start editing!",
					lastModified: Date.now()
				});
			},
			{
				onSuccess: () => queryClient.invalidateQueries(["projects"]),
				onError: err => {
					pushErrorAlert(
						(err as Error)?.message || "Service is not available!"
					);
				}
			}
		);

	const useGetProjects = () =>
		useQuery(
			["projects"],
			async () => {
				const projectCollection = collection(db, "projects");
				const q = query(projectCollection, where("owner", "==", user?.uid));
				const snapshot = await getDocs(q);

				const projects: Project[] = [];
				snapshot.forEach(doc => {
					const project = doc.data() as Project;
					projects.push({ ...project, id: doc.id });
				});
				return projects;
			},
			{
				enabled: !!user,
				onError: () => pushErrorAlert("Service is not available!")
			}
		);

	const useDeleteProjects = () =>
		useMutation(
			async (projectIds: string[]) => {
				// delete all images stored in Firebase storage at the meantime
				// for all selectded projects
				const initDeleteImgs: Promise<void>[] = [];
				projectIds.forEach(async id => {
					initDeleteImgs.push(...(await deleteImages(id)));
				});
				Promise.all(initDeleteImgs);

				const projectCollection = collection(db, "projects");
				const q = query(
					projectCollection,
					where(documentId(), "in", projectIds)
				);
				const projects = await getDocs(q);
				projects.forEach(async project_doc => {
					await deleteDoc(project_doc.ref);
				});
			},
			{
				onSuccess: () => queryClient.invalidateQueries(["projects"]),
				onError: () => {
					pushErrorAlert("Service is not available!");
				}
			}
		);

	const useUpdateDoc = () => {
		const { id } = useParams();
		return useMutation(async (newDoc: string) => {
			if (id) {
				const project = doc(db, "projects", id);
				await updateDoc(project, {
					document: newDoc,
					lastModified: Date.now()
				});
			}
		});
	};

	return {
		getProject,
		useGetProjects,
		useCreateProject,
		useDeleteProjects,
		useUpdateDoc,
		members,
		setMembers
	};
};

export default useProject;
