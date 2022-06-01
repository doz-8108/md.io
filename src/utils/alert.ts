import { toast } from "react-hot-toast";

export const pushSuccessAlert = (message: string) => toast.success(message);
export const pushErrorAlert = (message: string) => toast.error(message);
export const pushEmojiAlert = ({
	icon,
	message
}: {
	icon: string;
	message: string;
}) => toast(message, { icon });
export const pushPromiseAlert = <T>(
	mutate: Promise<T>,
	{
		loading,
		success,
		error
	}: { loading: string; success: string; error: string }
) =>
	toast.promise(mutate, {
		loading,
		success,
		error
	});
