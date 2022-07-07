import React from "react";
import styled from "styled-components";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";

import Tools from "../components/Tools";
import ProjectList from "./projectList";
import Project from "./project";
import UtilBox from "components/UtilsBox";
import Spinner from "components/Spinner";
import { useAuth } from "../components/providers/Auth";

import BgLeft from "../assets/list-bg-l.png";
import BgRight from "../assets/list-bg-r.png";

const Entry = () => {
	const { pathname } = useLocation();
	const { user } = useAuth();

	const routeElement = user ? <Project /> : <Navigate to="/projects" replace />;
	const enterProject = pathname !== "/projects";

	return (
		<Container>
			<PageHeader>
				<PageHeaderLeft>
					{enterProject ? (
						<Tools />
					) : (
						<h2>
							md.<span>io</span>
						</h2>
					)}
				</PageHeaderLeft>
				<PageHeaderRight>
					<UtilBox render={enterProject} />
				</PageHeaderRight>
			</PageHeader>
			{/* Firebase auth can be null first time even if the user have signed in  */}
			{user === undefined ? (
				<Spinner />
			) : (
				<Routes>
					<Route path="/projects" element={<ProjectList />} />
					<Route path="/projects/:id" element={routeElement} />
					<Route path="*" element={<Navigate to="/projects" replace />} />
				</Routes>
			)}
		</Container>
	);
};

const Container = styled.div`
	width: 100vw;
	height: 100vh;
	position: relative;

	background-image: url(${BgRight}), url(${BgLeft});
	background-repeat: no-repeat;
	background-position: right top, left bottom;

	@media only screen and (max-width: 640px) {
		background-image: url(${BgRight});
		background-position: right top;
	}
`;

const PageHeaderRight = styled.div`
	display: flex;
	align-items: center;
`;

const PageHeaderLeft = styled.div`
	font-size: 2rem;
	cursor: pointer;
	display: flex;
	align-items: center;

	& h2 span {
		color: var(--color-blue);
	}
`;

const PageHeader = styled.header`
	display: flex;
	width: 100vw;
	justify-content: space-between;
	height: 5rem;
	box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
	padding: 0 1.5vw;
	background-color: #fff;
	position: relative;
	z-index: 100;
`;

export default Entry;
