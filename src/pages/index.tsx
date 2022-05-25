import React, { useRef, useState } from "react";
import styled from "styled-components";
import { Button, Menu, MenuItem } from "@mui/material";
import { Route, Routes, Navigate } from "react-router-dom";

import { useAuth } from "../components/providers/auth";
import { pushSuccessAlert } from "utils/alert";
import ProjectList from "./projectList";
import Editor from "./editor";

import ProjectListBg from "../assets/project-list-bg.png";
import GoogleLogo from "../assets/Google-logo.svg";

const Entry = () => {
	return (
		<Container>
			<Background />
			<PageHeader>
				<PageHeaderLeft>
					<h2>
						md.<span>io</span>
					</h2>
				</PageHeaderLeft>
				<PageHeaderRight>
					<NameBox />
				</PageHeaderRight>
			</PageHeader>
			<Routes>
				<Route path="/projects" element={<ProjectList />} />
				<Route path="/projects/:id" element={<Editor />} />
				<Route path="*" element={<Navigate to="/projects" />} />
			</Routes>
			<PageFooter>Made with ❤️ by Ben L.</PageFooter>
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
			<InviteButton
				variant="outlined"
				color="secondary"
				title="Invite others to edit online!"
				onClick={handleInvite}
			>
				Invite
			</InviteButton>
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

const InviteButton = styled(Button)`
	text-transform: none !important;
	font-size: 1.7rem !important;
	padding: 0 1rem !important;
	margin-right: 2rem !important;
`;

const Background = styled.div`
	border-radius: 15px;
	height: 768px;
	width: 1368px;
	background-image: url(${ProjectListBg});
	background-repeat: no-repeat;
	background-position: center;
	position: absolute;
	top: 7rem;
	left: 50%;
	transform: translateX(-50%);
	z-index: -1;

	@media only screen and (max-width: 1368px) {
		top: 5rem;
		width: 100%;
		border-radius: 0;
	}
`;

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

const PageFooter = styled.footer`
	text-align: center;
	padding-bottom: 5;
	position: absolute;
	left: 50%;
	bottom: 4rem;
	transform: translateX(-50%);
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
`;

export default Entry;
