import React, { useState } from "react";
import {
	TextField,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle
} from "@mui/material";
import styled from "styled-components";
import { LoadingButton } from "@mui/lab";

import useStorage from "../../hooks/useStorage";

const Modal = ({
	closeModal,
	open
}: {
	open: boolean;
	closeModal: () => void;
}) => {
	const [isInputEmpty, setInputEmpty] = useState(false);
	const [projectName, setProjectName] = useState("");
	const { useCreateProject } = useStorage();
	const { mutateAsync: createProject, isLoading } = useCreateProject();
	const shouldDialogClose = () => !isLoading && closeModal();

	const handleFormSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
		e.preventDefault();
		if (projectName) {
			await createProject(projectName);
			setProjectName("");
			closeModal();
		} else {
			setInputEmpty(true);
		}
	};

	return (
		<div>
			<Dialog open={open} onClose={shouldDialogClose}>
				<form>
					<DialogTitle sx={{ fontSize: "2rem" }}>
						Create new project
					</DialogTitle>
					<DialogContent>
						<CustomizedInput
							required
							error={isInputEmpty}
							id="project name"
							label="Enter the project name"
							variant="standard"
							value={projectName}
							onChange={e => {
								setInputEmpty(false);
								setProjectName(e.target.value);
							}}
						/>
					</DialogContent>
					<DialogActions>
						<LoadingButton
							loading={isLoading}
							type="submit"
							sx={{ fontSize: "1.5rem" }}
							onClick={handleFormSubmit}
						>
							submit
						</LoadingButton>
					</DialogActions>
				</form>
			</Dialog>
		</div>
	);
};

const CustomizedInput = styled(TextField)`
	width: 350px;

	& label,
	input {
		font-size: 1.5rem !important;
	}
`;

export default Modal;
