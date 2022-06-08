import React, { useEffect, useState } from "react";
import { Button, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { BsLink } from "react-icons/bs";
import styled from "styled-components";

import { pushSuccessAlert } from "utils/alert";
import { Participant } from "types/participant";
import { useCMContext } from "./providers/code-mirror";

const InviteModal = ({
	open,
	onClose
}: {
	open: boolean;
	onClose: () => void;
}) => {
	const [members, setMembers] = useState<Participant[]>([]);
	const { socket, ACTIONS } = useCMContext();

	useEffect(() => {
		if (socket.current) {
			socket.current.on(
				ACTIONS.QUERY,
				({ participants }: { participants: Participant[] }) => {
					setMembers(participants);
				}
			);
		}
	}, [socket]);

	return (
		<Dialog open={open} onClose={onClose}>
			<form>
				<DialogTitle
					sx={{ fontSize: "1.8rem", display: "flex", alignItems: "center" }}
				>
					<BsLink
						size={35}
						style={{
							marginRight: "1rem",
							borderRadius: "50%",
							backgroundColor: "var(--color-blue)",
							color: "#fff",
							padding: "4px"
						}}
					/>
					Share project with others
				</DialogTitle>
				<DialogContent>
					<CopyBox>
						<p>{window.location.href}</p>
						<Button
							sx={{ fontSize: "1.4rem" }}
							title="Copy invitation link"
							onClick={() => {
								navigator.clipboard
									.writeText(window.location.href)
									.then(() =>
										pushSuccessAlert("Copied invitation URL to clipboard!")
									);
							}}
						>
							Copy
						</Button>
					</CopyBox>
					<Participants>
						{members.length > 0 && (
							<>
								<p>Who are editing this project</p>
								<ul>
									{members.map((m, index) => (
										<li key={index}>
											<img
												src={m.avatarURL}
												alt="participants' avatar"
												title={m.name}
											/>
										</li>
									))}
								</ul>
							</>
						)}
					</Participants>
				</DialogContent>
			</form>
		</Dialog>
	);
};

const Participants = styled.div`
	margin-top: 2rem;

	p {
		font-size: 1.6rem;
		display: flex;
		align-items: center;
	}

	ul {
		display: flex;
		list-style: none;
		max-width: 100%;
		margin-top: 1rem;
		overflow-x: scroll;
		scrollbar-width: none;

		&::-webkit-scrollbar {
			background-color: transparent;
			height: 6px;
		}

		&::-webkit-scrollbar-thumb {
			border-radius: 10px;
			background-color: #e8e8e8;
		}
	}

	li {
		&:not(:first-child) {
			margin-left: -1.5rem;
		}

		img {
			cursor: pointer;
			width: 4.5rem;
			height: 4.5rem;
			border-radius: 50%;
			box-sizing: content-box;
			border: 3px solid #e8e8e8;
			-webkit-user-drag: none;
			box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
		}
	}
`;

const CopyBox = styled.div`
	display: flex;
	align-items: center;

	p {
		margin-right: 1rem;
		padding: 6px;
		font-size: 1.4rem;
		background-color: #e8e8e8;
		border-radius: 5px;
		display: block;
		max-width: 100%;
		overflow-x: scroll;
		scrollbar-width: none;

		&::-webkit-scrollbar {
			display: none;
		}
	}
`;

export default InviteModal;
