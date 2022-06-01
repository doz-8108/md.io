import { useCallback } from "react";
import {
	getStorage,
	ref,
	uploadString,
	list,
	ListResult,
	StorageError,
	deleteObject,
	getBlob
} from "firebase/storage";
import { useMutation, useQueryClient, useQuery } from "react-query";

import { useAuth } from "../components/providers/auth";
import { pushErrorAlert } from "utils/alert";
import useProjectName from "./useProjectName";

// default markdown file for new project
const emptyMarkdownB64 =
	"data:application/octet-stream;base64,IyMjIFN0YXJ0IEVkaXRpbmchDQo=";

const useStorage = () => {
	const { user } = useAuth();
	const storage = getStorage();
	const queryClient = useQueryClient();
	const listRef = ref(storage, `/${user?.uid}`);
	const projectName = useProjectName();

	const uploadImage = useCallback(
		(dataURL: string, ext: string) => {
			const imageRef = ref(
				storage,
				`/${user?.uid}/${projectName}/${Date.now()}.${ext}`
			);
			console.log(`/${user?.uid}/${projectName}/${Date.now()}.${ext}`);

			return uploadString(imageRef, dataURL, "data_url", {
				customMetadata: {
					type: "upload"
				}
			});
		},
		[projectName, storage, user?.uid]
	);

	// const deleteImages;

	const getProject = useCallback(async () => {
		if (user) {
			const docRef = ref(storage, `${user?.uid}/${projectName}/index.md`);
			return getBlob(docRef);
		}
	}, [user, storage, projectName]);

	const useProjectList = () => {
		return useQuery(["projects"], () => list(listRef), {
			enabled: !!user,
			onError: () => pushErrorAlert("Service is not available!")
		});
	};

	const useCreateProject = () => {
		return useMutation(
			(projectName: string) => {
				const projectCache = queryClient.getQueryData([
					"projects"
				]) as ListResult;
				const quota = 5 - projectCache?.prefixes.length;

				const docName = `${projectName}:${Date.now()}`;
				const docRef = ref(storage, `/${user?.uid}/${docName}/index.md`);
				return uploadString(docRef, emptyMarkdownB64, "data_url", {
					customMetadata: {
						quota: quota.toString(),
						type: "create"
					}
				});
			},
			{
				onSuccess: () => queryClient.invalidateQueries(["projects"]),
				onError: err => {
					const projectLimitExceed =
						(err as StorageError).code === "storage/unauthorized";
					pushErrorAlert(
						projectLimitExceed
							? "You can only create 5 projects!"
							: "Service is not available!"
					);
				}
			}
		);
	};

	const useDeleteProject = () => {
		return useMutation(
			(projects: string[]) => {
				const target: Promise<void>[] = [];
				projects.forEach(async project => {
					const children = (
						await list(ref(storage, `/${user?.uid}/${project}/`))
					).items;

					children.forEach(child => {
						const docRef = ref(storage, child.fullPath);
						target.push(deleteObject(docRef));
					});
				});
				return Promise.all(target);
			},
			{
				onSuccess: () => queryClient.invalidateQueries(["projects"]),
				onMutate: target => {
					// Optimistic update
					const cached = queryClient.getQueryData(["projects"]) as ListResult;
					const cachedProjects = cached.prefixes || [];
					const New = cachedProjects.filter(
						cache => !target.includes(cache.name)
					);

					return { ...cached, prefixes: New };
				},
				onError: () => {
					pushErrorAlert("Service is not available!");
				}
			}
		);
	};
	// const saveProject;

	return {
		getProject,
		useProjectList,
		useCreateProject,
		useDeleteProject,
		// deleteProject,
		// saveProject
		// deleteImages,
		uploadImage
	};
};

export default useStorage;
