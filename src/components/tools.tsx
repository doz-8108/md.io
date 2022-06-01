import React from "react";
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
import { AiOutlineEnter } from "react-icons/ai";
import { useCMContext } from "./providers/code-mirror";

const Tools = () => {
	const { formatText, toList, addLineBreak, insertTable, insertURL } =
		useCMContext();
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

	return (
		<>
			<List>
				{toolsCongfigs.map(({ title, icon, clickEvent }, index) => {
					return (
						<ListItem key={index}>
							<button title={title} onClick={clickEvent}>
								{icon}
							</button>
						</ListItem>
					);
				})}
			</List>
		</>
	);
};

const ListItem = styled.li`
	margin-right: 1rem;
	width: 34px;
	height: 34px;
	display: flex;
	align-items: center;
	justify-content: center;

	button {
		background: none;
		border: none;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		padding: 5px;
	}

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
`;

export default Tools;
