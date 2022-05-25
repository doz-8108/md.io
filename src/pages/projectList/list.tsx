import React, { useState } from "react";
import {
	Paper,
	TableContainer,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableFooter,
	TableCell,
	Checkbox,
	CircularProgress,
	IconButton
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import styled from "styled-components";
import { AiOutlinePlus } from "react-icons/ai";
import { RiDeleteBin2Line } from "react-icons/ri";
import dayjs from "dayjs";

import useStorage from "../../hooks/useStorage";

interface Project {
	name: string;
	lastModified: Date;
}

const List = ({
	projects,
	openModal,
	isLoading
}: {
	projects: Project[];
	openModal: () => void;
	isLoading: boolean;
}) => {
	const { useDeleteProject } = useStorage();
	const { mutateAsync } = useDeleteProject();
	const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

	const toggleProjectFromList = (projectName: string) => {
		const tmp = [...selectedProjects];
		const projectIndex = selectedProjects.findIndex(
			selectedProject => selectedProject === projectName
		);
		setSelectedProjects(() => {
			projectIndex !== -1 ? tmp.splice(projectIndex, 1) : tmp.push(projectName);
			return tmp;
		});
	};

	const deleteProject = async () => {
		await mutateAsync(selectedProjects);
		setSelectedProjects([]);
	};

	return (
		<TableContainer
			component={Paper}
			sx={{
				boxShadow: "0 5px 5px rgba(0,0,0,.2)",
				borderRadius: "10px"
			}}
		>
			<Table aria-label="project list table" stickyHeader>
				<TableHead>
					<TableRow>
						{["Project name", "Last modified"].map((field, index) => (
							<TableCell
								key={index}
								sx={{ fontSize: "1.5rem", fontWeight: 700 }}
								align={index !== 0 ? "right" : "left"}
							>
								{field}
							</TableCell>
						))}
					</TableRow>
				</TableHead>
				<TableBody
					sx={{ width: "100%", maxHeight: "450px", overflow: "scroll" }}
				>
					{projects.length ? (
						projects.map((project, index) => (
							<Row
								key={index}
								toggleProjectFromList={toggleProjectFromList}
								projectInfo={project}
							/>
						))
					) : (
						<EmptyIndicator isLoading={isLoading} />
					)}
				</TableBody>
				<TableFooter>
					<TableRow>
						<TableCell colSpan={3}>
							<Actions>
								<IconButton
									color="error"
									disabled={!selectedProjects.length}
									title="delete project"
									aria-label="button for deleting project"
									onClick={deleteProject}
								>
									<RiDeleteBin2Line size={25} />
								</IconButton>
								<LoadingButton
									loading={isLoading}
									variant="contained"
									color="primary"
									sx={{
										display: "flex",
										alignItems: "center",
										fontSize: "1.4rem"
									}}
									title="create project"
									aria-label="button for creating projects"
									onClick={openModal}
								>
									<AiOutlinePlus size={20} style={{ marginRight: ".5rem" }} />
									Create
								</LoadingButton>
							</Actions>
						</TableCell>
					</TableRow>
				</TableFooter>
			</Table>
		</TableContainer>
	);
};

const EmptyIndicator = ({ isLoading }: { isLoading: boolean }) => (
	<TableRow sx={{ height: "300px" }}>
		<TableCell colSpan={3} sx={{ textAlign: "center", fontSize: "1.6rem" }}>
			{isLoading ? (
				<CircularProgress />
			) : (
				"📃 You do not have any project yet..."
			)}
		</TableCell>
	</TableRow>
);

const Row = ({
	projectInfo,
	toggleProjectFromList
}: {
	projectInfo: Project;
	toggleProjectFromList: (param: string) => void;
}) => {
	const { name, lastModified } = projectInfo;
	const dateInNum = Number(lastModified);

	return (
		<CustomizedRow sx={{ cursor: "pointer" }}>
			<CustomizedCell component="th" scope="row">
				<Checkbox
					onChange={() => toggleProjectFromList(`${name}:${dateInNum}`)}
				/>
				{name}
			</CustomizedCell>
			<CustomizedCell align="right">
				{dayjs(lastModified).format("YYYY-MM-DD")}
			</CustomizedCell>
		</CustomizedRow>
	);
};

const Actions = styled.div`
	list-style: none;
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 5rem;
`;

const CustomizedCell = styled(TableCell)`
	font-size: 1.4rem !important;
	padding-top: 1rem !important;
	padding-bottom: 1rem !important;

	& span svg {
		width: 2rem !important;
		height: 2rem !important;
	}
`;

const CustomizedRow = styled(TableRow)`
	&:hover {
		background-color: var(--color-grey);
	}
`;

export default List;
