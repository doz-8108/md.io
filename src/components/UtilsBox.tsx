import React, { useRef, useState } from "react";
import { Button, IconButton, Menu, MenuItem } from "@mui/material";
import { MdGroupAdd } from "react-icons/md";
import styled from "styled-components";

import { useAuth } from "./providers/Auth";
import InviteModal from "./InviteModal";

import GoogleLogo from "../assets/Google-logo.svg";

const UtilBox = ({ render }: { render: boolean }) => {
	const { user, login, logout } = useAuth();
	const [popoverOpen, setPopoverOpen] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const nameBox = useRef(null);

	const handleLogout = () => {
		logout();
		setPopoverOpen(false);
	};

	return user ? (
		<>
			{render && (
				<>
					<IconButton
						sx={{
							textTransform: "none",
							padding: "0 1rem",
							marginRight: "1rem"
						}}
						color="secondary"
						title="Invite others to edit online!"
						aria-label="Invite others to edit online!"
						onClick={() => setModalOpen(true)}
					>
						<MdGroupAdd size={30} />
					</IconButton>
					<InviteModal open={modalOpen} onClose={() => setModalOpen(false)} />
				</>
			)}
			<PopoverEntry onClick={() => setPopoverOpen(true)} ref={nameBox}>
				<img
					src={user.photoURL || undefined}
					alt="user avatar"
					referrerPolicy="no-referrer"
				/>
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

const PopoverEntry = styled.button`
	background: none;
	border: none;
	font-size: 2rem;
	cursor: pointer;

	img {
		display: block;
		margin: auto;
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 50%;
		border: 1px solid #e8e8e8;
	}
`;

export default UtilBox;
