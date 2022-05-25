import React, { useState } from "react";
import styled from "styled-components";
import List from "./list";
import Modal from "./modal";

import useStorage from "hooks/useStorage";
import { useAuth } from "components/providers/auth";
import { pushEmojiAlert } from "utils/alert";

const ProjectList = () => {
	const { user, login } = useAuth();
	const [modalOpen, setModalOpen] = useState(false);
	const { useProjectList } = useStorage();
	const { data, isLoading } = useProjectList();

	const projects = data?.prefixes.map(pathname => {
		const [name, date] = pathname.name.split(":");
		return { name, lastModified: new Date(Number(date)) };
	});

	const handleClickOpen = () => {
		if (user) setModalOpen(true);
		else {
			pushEmojiAlert({ message: "Welcome, please login first!", icon: "👋" });
			login();
		}
	};
	const handleClose = () => setModalOpen(false);

	return (
		<Container>
			<List
				isLoading={isLoading}
				projects={projects || []}
				openModal={() => handleClickOpen()}
			/>
			<Modal open={modalOpen} closeModal={handleClose} />
		</Container>
	);
};

const Container = styled.main`
	width: 55vw;
	margin: auto;
	height: calc(100% - 5rem - 25px);
	padding-top: 10rem;

	@media only screen and (max-width: 1024px) {
		width: 75vw;
	}

	@media only screen and (max-width: 640px) {
		width: 95vw;
	}
`;

export default ProjectList;
