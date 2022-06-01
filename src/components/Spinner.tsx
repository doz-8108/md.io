import React from "react";
import { CircularProgress } from "@mui/material";
import styled from "styled-components";

const Spinner = () => {
	return (
		<Container>
			<CircularProgress />
		</Container>
	);
};

const Container = styled.div`
	display: flex;
	height: calc(100vh - 50px);
	justify-content: center;
	align-items: center;
`;

export default Spinner;
