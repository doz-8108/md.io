import {
	getStorage,
	ref,
	uploadString,
	list,
	ListResult,
	StorageError,
	deleteObject
} from "firebase/storage";
import { useAuth } from "components/providers/auth";
import { useMutation, useQueryClient, useQuery } from "react-query";
import { pushErrorAlert } from "utils/alert";

// default markdown file for new project
const emptyMarkdownB64 =
	"data:application/octet-stream;base64,IyMjIFN0YXJ0IEVkaXRpbmchDQo=";

const useStorage = () => {
	const { user } = useAuth();
	const storage = getStorage();
	const queryClient = useQueryClient();
	const listRef = ref(storage, `/${user?.uid}`);

	// const uploadImages = () => {};
	// const deleteImages;
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
		useProjectList,
		useCreateProject,
		useDeleteProject
		// deleteProject,
		// saveProject
		// deleteImages,
		// uploadImages,
	};
};

export default useStorage;
