import { useCallback } from "react";
import {
	getStorage,
	uploadString,
	deleteObject,
	ref,
	list
} from "firebase/storage";

import { useAuth } from "../components/providers/auth";

const useStorage = () => {
	const { user } = useAuth();
	const storage = getStorage();

	const uploadImage = useCallback(
		(dataURL: string, ext: string) => {
			const id = window.location.href.match(/\/projects\/(.+)/)?.[1];
			const imageRef = ref(storage, `/${user?.uid}/${id}/${Date.now()}.${ext}`);

			return uploadString(imageRef, dataURL, "data_url", {
				customMetadata: {
					type: "upload"
				}
			});
		},
		[storage, user?.uid]
	);

	const deleteImages = async (projectId: string) => {
		const dir = await list(ref(storage, `/${user?.uid}/${projectId}/`));
		return dir.items.map(file => {
			const fileRef = ref(storage, file.fullPath);
			return deleteObject(fileRef);
		});
	};

	return {
		deleteImages,
		uploadImage
	};
};

export default useStorage;
