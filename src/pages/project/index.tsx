import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import Spinner from "components/Spinner";
import useProjectName from "hooks/useProjectName";
import useStorage from "hooks/useStorage";
import Editor from "./editor";
import Preview from "./preview";

const Project = () => {
	const projectName = useProjectName();
	const { getProject } = useStorage();
	const [input, setInput] = useState("");
	const [initialVal, setInitialVal] = useState<string | null>(null);

	const handleChange = useCallback((input: string) => {
		setInput(input);
	}, []);

	useEffect(() => {
		const reader = new FileReader();
		reader.onload = () => {
			setInitialVal(reader.result as string);
		};

		getProject().then(res => {
			if (res) reader.readAsText(res);
		});
	}, [getProject, projectName]);

	return (
		<Container>
			{initialVal ? (
				<>
					<Editor initialVal={initialVal} handleChange={handleChange} />
					<Preview input={input} />
				</>
			) : (
				<Spinner />
			)}
		</Container>
	);
};

const Container = styled.main`
	height: calc(100% - 5rem);
	display: flex;
	justify-content: center;
`;

export default Project;
