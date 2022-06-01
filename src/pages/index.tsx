import React, { useRef, useState } from "react";
import styled from "styled-components";
import { Button, Menu, MenuItem } from "@mui/material";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../components/providers/auth";
import { pushSuccessAlert } from "utils/alert";
import ProjectList from "./projectList";
import Tools from "../components/tools";
import Project from "./project";

import GoogleLogo from "../assets/Google-logo.svg";

const Entry = () => {
	const { pathname } = useLocation();
	const notProjectList = pathname.match(/\/projects\/(.+)/);

	return (
		<Container>
			<PageHeader>
				<PageHeaderLeft>
					{notProjectList ? (
						<Tools />
					) : (
						<h2>
							md.<span>io</span>
						</h2>
					)}
				</PageHeaderLeft>
				<PageHeaderRight>
					<NameBox />
				</PageHeaderRight>
			</PageHeader>
			<Routes>
				<Route path="/projects" element={<ProjectList />} />
				<Route path="/projects/:id" element={<Project />} />
				<Route path="*" element={<Navigate to="/projects" replace />} />
			</Routes>
		</Container>
	);
};

const NameBox = () => {
	const { user, login, logout } = useAuth();
	const [popoverOpen, setPopoverOpen] = useState(false);
	const nameBox = useRef(null);

	const handleLogout = () => {
		logout();
		setPopoverOpen(false);
	};

	const handleInvite = () => {
		pushSuccessAlert("Copied invitation link to your clipboard!");
	};

	return user ? (
		<>
			<Button
				sx={{
					textTransform: "none",
					fontSize: "1.7rem",
					padding: "0 1rem",
					marginRight: "2rem"
				}}
				variant="outlined"
				color="secondary"
				title="Invite others to edit online!"
				onClick={handleInvite}
			>
				Invite
			</Button>
			<PopoverEntry onClick={() => setPopoverOpen(true)} ref={nameBox}>
				Hi, {user?.displayName}
			</PopoverEntry>
			<Menu
				open={popoverOpen}
				onClose={() => setPopoverOpen(false)}
				anchorEl={nameBox.current}
			>
				<MenuItem onClick={handleLogout} style={{ fontSize: "1.4rem" }}>
					Logout
				</MenuItem>
			</Menu>
		</>
	) : (
		<Button
			color="primary"
			variant="outlined"
			style={{ padding: ".4rem .7rem" }}
			onClick={login}
		>
			<img
				src={GoogleLogo}
				alt="login with your Google account"
				style={{ width: "3rem", marginRight: "1rem" }}
			/>
			<span>Login with Google</span>
		</Button>
	);
};

const Container = styled.div`
	width: 100vw;
	height: 100vh;
	position: relative;
`;

const PopoverEntry = styled.button`
	background: none;
	border: none;
	font-size: 2rem;
	cursor: pointer;
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
