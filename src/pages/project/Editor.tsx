import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import "codemirror/lib/codemirror";
import "codemirror/addon/edit/continuelist";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/markdown/markdown";
import "./index.css";

import { useCMContext } from "components/providers/CodeMirror";
import { Cursor } from "../../types/cursor";
import { Participant } from "../../types/participant";
import { useAuth } from "components/providers/Auth";

const randomColor = require("randomcolor");

interface PropTypes {
	initialVal: string;
	members: Participant[];
	handleChange: (input: string, pos: Cursor) => void;
	view: boolean;
	matches: boolean;
}

const offsetLeft_max = "calc(100% - 4px)";
const colorArray = Array.from({ length: 10 }, () =>
	randomColor({ luminosity: "dark" })
);

const Editor = ({
	initialVal,
	handleChange,
	members,
	view,
	matches
}: PropTypes) => {
	const { user } = useAuth();
	const container = useRef<HTMLDivElement | null>(null);
	const containerWidth = useRef(0);
	let { setPreset, editorRoot } = useCMContext();

	useEffect(() => {
		containerWidth.current =
			container.current?.getBoundingClientRect().width || 0;

		if (initialVal !== null) {
			setPreset({
				initialVal,
				handleChange
			});
		}
	}, [handleChange, initialVal, setPreset]);

	return (
		<EditorContainer
			ref={container}
			className="editor"
			style={{ display: matches && view ? "none" : "block" }}
		>
			{members.map((m, index) => {
				if (m.uid === user?.uid) return false;

				const offsetLeft = (m.pos?.ch || 0) * 12 + 34;
				return (
					<UserCursor
						key={index}
						username={m.name || ""}
						color={colorArray[index]}
						style={{
							top: `${(m.pos?.line || 0) * 20 + 4}px`,
							left:
								offsetLeft > containerWidth.current
									? offsetLeft_max
									: `${offsetLeft}px`
						}}
					></UserCursor>
				);
			})}
			<textarea ref={editorRoot} />
		</EditorContainer>
	);
};

const EditorContainer = styled.div`
	width: 50%;
	position: relative;

	@media only screen and (max-width: 640px) {
		width: 100%;
	}
`;

const UserCursor = styled.div<{ username: string; color: string }>`
	user-select: none;
	-webkit-user-drag: none;

	&::before {
		position: absolute;
		content: "${props => props?.username || ""}";
		color: #fff;
		background-color: ${props => props.color || "inherit"};
		padding: 1px 5px;
		border-radius: 2px;
		top: -120%;
		transform: translateX(-50%);
		width: max-content;
		opacity: 0.7;
	}

	color: ${props => props.color || "inherit"};
	position: absolute;
	width: 2px;
	height: 20px;
	z-index: 110;
	animation: blink 1.1s infinite;

	@keyframes blink {
		0% {
			background-color: currentColor;
		}

		50% {
			background-color: #fff;
		}

		100% {
			background-color: currentColor;
		}
	}
`;

export default Editor;
