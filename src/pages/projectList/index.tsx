import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
import { Button } from "@mui/material";

import List from "./List";
import Modal from "./Modal";
import useProject from "hooks/useProject";
import { useAuth } from "../../components/providers/Auth";
import { pushEmojiAlert, pushErrorAlert } from "utils/alert";

const ProjectListpage = () => {
	document.title = "Welcome to md.io";
	const [searchParams] = useSearchParams();
	const { user, login } = useAuth();
	const { useGetProjects } = useProject();
	const [modalOpen, setModalOpen] = useState(false);

	const { data: projects, isLoading } = useGetProjects();

	const handleClickOpen = () => {
		pushEmojiAlert({ message: "Welcome, please login first!", icon: "👋" });
		login();
	};
	const handleClose = () => setModalOpen(false);

	useEffect(() => {
		const error = searchParams.get("error");
		if (error) {
			if (error === "connection_failed")
				pushErrorAlert("Service is not available! Please try again later!");
			else pushErrorAlert("Only 10 members can edit simultaneously!");
		}
	}, [searchParams]);

	return (
		<Container>
			{!user ? (
				<Legend>
					<h1
						style={{
							textAlign: "center",
							fontSize: "clamp(2.625rem, 1.2857rem + 3.5714vw, 6rem)"
						}}
					>
						<span>Share</span> and <span>edit</span> your markdown
					</h1>
					<Button
						variant="contained"
						sx={{ fontSize: "1.5rem" }}
						onClick={handleClickOpen}
					>
						Get Started
					</Button>
				</Legend>
			) : (
				<>
					<List
						isLoading={isLoading}
						projects={projects || []}
						openModal={() => setModalOpen(true)}
					/>
					<Modal open={modalOpen} closeModal={handleClose} />
				</>
			)}
			<PageFooter>Made with ❤️ by Ben L.</PageFooter>
		</Container>
	);
};

const Legend = styled.div`
	width: 40%;
	margin: auto;
	text-align: center;
	font-size: clamp(2.625rem, 1.2857rem + 3.5714vw, 6rem);

	span {
		color: var(--color-blue);
	}

	@media only screen and (max-width: 640px) {
		width: 55%;
		margin-top: 15rem;
	}
`;

const Container = styled.main`
	width: 55vw;
	margin: auto;
	height: calc(100% - 5rem - 25px);
	padding-top: 10rem;
	background-color: transparent;

	@media only screen and (max-width: 1024px) {
		width: 75vw;
	}

	@media only screen and (max-width: 640px) {
		width: 95vw;
	}
`;

const PageFooter = styled.footer`
	text-align: center;
	padding: 5px 10px;
	position: absolute;
	left: 50%;
	bottom: 4rem;
	transform: translateX(-50%);

	@media only screen and (max-width: 640px) {
		border-radius: 10px;
		background-color: rgba(255, 255, 255, 0.9);
		box-shadow: 0 5px 5px rgba(0, 0, 0, 0.2);
	}
`;

export default ProjectListpage;
