import { useCallback } from "react";
import {
	getStorage,
	ref,
	uploadString,
	list,
	ListResult,
	StorageError,
	deleteObject,
	getBlob,
	getMetadata
} from "firebase/storage";
import { useMutation, useQueryClient, useQuery } from "react-query";

import { useAuth } from "../components/providers/auth";
import { pushErrorAlert } from "utils/alert";
import projectName from "../utils/projectName";

// default markdown file for new project
const emptyMarkdownB64 =
	"data:application/octet-stream;base64,IyMjIFN0YXJ0IEVkaXRpbmchDQo=";

const useStorage = () => {
	const { user } = useAuth();
	const storage = getStorage();
	const queryClient = useQueryClient();
	const listRef = ref(storage, `/${user?.uid}`);
	const pjName = projectName();

	const uploadImage = useCallback(
		(dataURL: string, ext: string) => {
			const imageRef = ref(
				storage,
				`/${user?.uid}/${pjName}/${Date.now()}.${ext}`
			);
			console.log(`/${user?.uid}/${pjName}/${Date.now()}.${ext}`);

			return uploadString(imageRef, dataURL, "data_url", {
				customMetadata: {
					type: "upload"
				}
			});
		},
		[pjName, storage, user?.uid]
	);

	// const deleteImages;

	const getProject = useCallback(async () => {
		if (user) {
			const docRef = ref(storage, `${user?.uid}/${pjName}/index.md`);
			return getBlob(docRef);
		}
	}, [user, storage, pjName]);

	const useProjectList = () => {
		return useQuery(
			["projects"],
			async () => {
				const projectList = await list(listRef);
				const metas = projectList.prefixes.map(item => {
					return getMetadata(ref(storage, `${item.fullPath}/index.md`));
				});
				return Promise.all(metas);
			},
			{
				enabled: !!user,
				onError: () => pushErrorAlert("Service is not available!")
			}
		);
	};

	const useCreateProject = () => {
		return useMutation(
			(pjName: string) => {
				const projectCache = queryClient.getQueryData([
					"projects"
				]) as ListResult;
				const quota = 5 - projectCache?.prefixes?.length || 5;

				const docName = encodeURIComponent(pjName);
				const docRef = ref(storage, `/${user?.uid}/${docName}/index.md`);

				return uploadString(docRef, emptyMarkdownB64, "data_url", {
					customMetadata: {
						quota: quota.toString(),
						type: "create",
						lastModified: Date.now().toString()
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
				return Promise.all(
					projects.map(project => {
						project = encodeURIComponent(project);
						return list(ref(storage, `/${user?.uid}/${project}/`));
					})
				).then(projectDirs => {
					const target: Promise<void>[] = [];
					projectDirs.forEach(dir => {
						dir.items.forEach(file => {
							const docRef = ref(storage, file.fullPath);
							target.push(deleteObject(docRef));
						});
					});

					return Promise.all(target);
				});
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
		// saveProject
		// deleteImages,
		uploadImage
	};
};

export default useStorage;
