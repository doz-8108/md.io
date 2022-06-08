import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { CircularProgress, useMediaQuery } from "@mui/material";
import { IoMdCloudDone } from "react-icons/io";
import {
	AiOutlineEye,
	AiOutlineEyeInvisible,
	AiOutlineFileText
} from "react-icons/ai";
import styled from "styled-components";

import Spinner from "components/spinner";
import useProject from "hooks/useProject";
import useDebounce from "hooks/useDebounce";
import Editor from "./editor";
import Preview from "./preview";
import { Cursor } from "types/cusor";
import { Participant } from "types/participant";
import { useAuth } from "components/providers/auth";
import { useCMContext } from "../../components/providers/code-mirror";

const ProjectPage = () => {
	document.title = "md.io editor";
	const { user } = useAuth();
	const { id } = useParams();
	const navigate = useNavigate();
	const matches = useMediaQuery("(max-width: 640px)");
	const { setValue, setCursor, codeMirror, socket, ACTIONS } = useCMContext();

	const { useUpdateDoc, getProject, setMembers, members } = useProject();
	const { mutateAsync, isLoading, isSuccess } = useUpdateDoc();

	const [view, setView] = useState(false);
	const [initialVal, setInitialVal] = useState<string | null>(null);
	const [input, setInput] = useState("");
	const isSync = useRef(true);
	const cursor = useRef<Cursor>({ line: 0, ch: 0 });
	const debouncedVal = useDebounce(input);

	const handleChange = useCallback((input: string, pos: Cursor) => {
		isSync.current = false;
		setInput(input);
		cursor.current = pos;
	}, []);

	useEffect(() => {
		if (id) {
			// sync content from DB
			if (initialVal === null) {
				getProject(id).then(project => {
					if (project) {
						setInput(project.document);
						setInitialVal(project.document);
					} else navigate("/projects", { replace: true });
				});
			}
		}
	}, []);

	useEffect(() => {
		if (initialVal && id && socket.current) {
			!socket.current.connected && socket.current.connect();

			socket.current.emit(ACTIONS.JOIN, {
				projectId: id,
				user: {
					name: user?.displayName,
					avatarURL: user?.photoURL,
					uid: user?.uid,
					pos: {
						line: 0,
						ch: 0
					}
				}
			});
		}

		return () => {
			if (initialVal) {
				socket.current.emit(ACTIONS.LEAVE, {
					projectId: id,
					uid: user?.uid
				});
				socket.current.disconnect();
			}
		};
	}, [initialVal, socket, user]);

	useEffect(() => {
		if (codeMirror && socket.current) {
			// sync content from others
			socket.current.on(
				ACTIONS.SYNC,
				({ m, doc }: { m: Participant[]; doc: string }) => {
					isSync.current = false;
					setMembers(m);
					setInput(doc);
					const prevCursor = { ...cursor.current };
					// this action will move the cursor back to (0,0)
					setValue(doc);
					// reset cursor position
					cursor.current = prevCursor;
					setCursor(prevCursor);
				}
			);
		}
	}, [codeMirror]);

	useEffect(() => {
		if (!isSync.current && debouncedVal !== undefined && debouncedVal !== null)
			mutateAsync(debouncedVal);
	}, [debouncedVal, mutateAsync]);

	return (
		<Container>
			<SwitchToggle onClick={() => setView(prev => !prev)}>
				{matches ? (
					<>
						<span>{view ? "Preview" : "Markdown"}</span>
						{view ? (
							<AiOutlineEye size={20} />
						) : (
							<AiOutlineEyeInvisible size={20} />
						)}
					</>
				) : (
					<ToggleContentLanscape>
						<div>
							<AiOutlineFileText size={20} />
							<span>Markdown</span>
						</div>
						<div>
							<AiOutlineEye size={20} /> <span>Preview</span>
						</div>
					</ToggleContentLanscape>
				)}
			</SwitchToggle>
			<InnerContainer>
				{initialVal !== null ? (
					<>
						<Editor
							initialVal={initialVal}
							handleChange={handleChange}
							members={members}
							view={view}
							matches={matches}
						/>
						<Preview input={input} view={view} matches={matches} />
						{(isLoading && (
							<Status>
								<CircularProgress
									color="secondary"
									size={15}
									sx={{ marginRight: "1.2rem" }}
								/>
								Saving...
							</Status>
						)) ||
							(isSuccess && (
								<Status>
									<IoMdCloudDone
										size={20}
										style={{
											color: "#21B632",
											marginRight: ".6rem",
											marginBottom: ".1rem"
										}}
									/>
									Saved
								</Status>
							))}
					</>
				) : (
					<Spinner />
				)}
			</InnerContainer>
		</Container>
	);
};

const ToggleContentLanscape = styled.div`
	display: grid;
	width: 100%;
	grid-template-columns: 50% 50%;
	justify-items: start;
	align-items: center;
	font-size: 1.5rem;

	span {
		padding: 0.4rem 0;
	}

	div {
		width: 100%;
		display: flex;
		align-items: center;
		padding: 0.5rem 0;
		padding-left: 1rem;

		&:last-of-type {
			border-left: 1px solid #c6c6c6;
		}

		span {
			margin-left: 1rem;
		}
	}
`;

const SwitchToggle = styled.button`
	font-size: 1.5rem;
	padding: 0 1.5rem;
	width: 100%;
	border: none;
	background-color: var(--color-blue);
	color: #fff;
	display: flex;
	justify-content: space-between;
	align-items: center;

	@media only screen and (max-width: 640px) {
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
	}
`;

const InnerContainer = styled.div`
	width: 100%;
	height: calc(100% - 3.5rem);
	display: flex;
	justify-content: center;
	position: relative;
`;

const Container = styled.main`
	height: calc(100% - 5rem);
`;

const Status = styled.span`
	position: fixed;
	z-index: 999;
	right: 5%;
	bottom: 5%;
	font-size: 1.3rem;
	display: flex;
	align-items: center;
	-webkit-user-drag: none;
	user-select: none;
`;

export default ProjectPage;
