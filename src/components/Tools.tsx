import React, { ReactNode, useRef, useState } from "react";
import styled from "styled-components";
import {
	GoBold,
	GoListOrdered,
	GoListUnordered,
	GoTasklist
} from "react-icons/go";
import {
	MdStrikethroughS,
	MdFormatQuote,
	MdLink,
	MdImage,
	MdCode
} from "react-icons/md";
import { FaItalic, FaTable } from "react-icons/fa";
import { FcPrevious } from "react-icons/fc";
import { AiOutlineEnter, AiFillAppstore } from "react-icons/ai";
import { useMediaQuery, Popover } from "@mui/material";

import { useNavigate } from "react-router";
import { useCMContext } from "./providers/CodeMirror";

const Wrapper = ({
	children,
	matches,
	open,
	onClose,
	anchorEl
}: {
	children: ReactNode;
	matches: boolean;
	open: boolean;
	onClose: (param: boolean) => void;
	anchorEl: HTMLButtonElement | null;
}) => {
	return matches ? (
		<Popover open={open} anchorEl={anchorEl} onClose={onClose}>
			<MenuGrid>{children}</MenuGrid>
		</Popover>
	) : (
		<>{children}</>
	);
};

const Tools = () => {
	const navigate = useNavigate();
	const {
		formatText,
		toList,
		addLineBreak,
		insertTable,
		insertURL,
		codeMirror
	} = useCMContext();
	const toolsCongfigs = [
		{
			title: "bold text",
			icon: <GoBold size={20} />,
			clickEvent: () => formatText("BOLD")
		},
		{
			title: "italic font style",
			icon: <FaItalic size={17} />,
			clickEvent: () => formatText("ITALIC")
		},
		{
			title: "line strike through",
			icon: <MdStrikethroughS size={22} style={{ marginTop: ".4rem" }} />,
			clickEvent: () => formatText("LINE_THROUGH")
		},
		{
			title: "unordered list",
			icon: <GoListUnordered size={18} />,
			clickEvent: () => toList("UNORDERED")
		},
		{
			title: "ordered list",
			icon: <GoListOrdered size={18} />,
			clickEvent: () => toList("ORDERED")
		},
		{
			title: "check list",
			icon: <GoTasklist size={17} />,
			clickEvent: () => toList("CHECK")
		},
		{
			title: "blockquote",
			icon: <MdFormatQuote size={25} />,
			clickEvent: () => toList("QUOTE")
		},
		{
			title: "code block",
			icon: <MdCode size={25} />,
			clickEvent: () => toList("CODE")
		},
		{
			title: "table",
			icon: <FaTable size={20} />,
			clickEvent: insertTable
		},
		{
			title: "link",
			icon: <MdLink size={25} />,
			clickEvent: () => insertURL("URL")
		},
		{
			title: "image",
			icon: <MdImage size={24} />,
			clickEvent: () => insertURL("IMG")
		},
		{
			title: "line break",
			icon: <AiOutlineEnter size={20} />,
			clickEvent: addLineBreak
		}
	];
	const matches = useMediaQuery("(max-width: 640px)");
	const [popoverOpen, setPopover] = useState(false);
	const menuButton = useRef(null);

	return (
		<List>
			{codeMirror && (
				<>
					<ListItem>
						<button
							title="back to project list"
							onClick={() => navigate("/projects", { replace: true })}
						>
							<FcPrevious size={25} />
						</button>
					</ListItem>
					{/* {matches ? ( */}
					{matches && (
						<MenuButton ref={menuButton} onClick={() => setPopover(true)}>
							<AiFillAppstore size={25} />
							<span>tools</span>
						</MenuButton>
					)}
					<Wrapper
						anchorEl={menuButton.current}
						matches={matches}
						open={popoverOpen}
						onClose={() => setPopover(false)}
					>
						{toolsCongfigs.map(({ title, icon, clickEvent }, index) => {
							return (
								<ListItem key={index}>
									<button
										title={title}
										onClick={clickEvent}
										style={{
											background: "none",
											border: "none",
											display: "flex",
											justifyContent: "center",
											alignItems: "center",
											cursor: "pointer",
											padding: "5px"
										}}
									>
										{icon}
									</button>
								</ListItem>
							);
						})}
					</Wrapper>
				</>
			)}
		</List>
	);
};

const MenuButton = styled.button`
	display: flex;
	align-items: center;
	border-radius: 10px;
	color: #2d3f4e;
	border: 1px solid currentColor !important;
	padding: 0.2rem 1rem;

	span {
		font-size: 1.6rem;
		margin-left: 0.8rem;
	}
`;

const MenuGrid = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	grid-template-rows: 1fr 1fr 1fr;
	grid-gap: 5px;
	padding: 10px;
`;

const ListItem = styled.li`
	margin-right: 1rem;
	width: 34px;
	height: 34px;
	display: flex;
	align-items: center;
	justify-content: center;

	&:hover {
		box-shadow: 0 5px 5px rgba(0, 0, 0, 0.2);
		button {
			color: var(--color-blue);
		}
	}
`;

const List = styled.ul`
	list-style: none;
	display: flex;
	justify-content: space-between;
	align-items: center;

	button {
		background: none;
		border: none;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
	}
`;

export default Tools;
