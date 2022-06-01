import React from "react";

const useProjectName = () => {
	const hash = window.location.hash;
	const projectName = decodeURIComponent(hash.substring(1, hash.length)).trim();
	const projectId = window.location.href.match(/\/projects\/(\d+)/)?.[1];

	return `${projectName}:${projectId}`;
};

export default useProjectName;
