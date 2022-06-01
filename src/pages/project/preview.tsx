import React from "react";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";

const Preview = ({ input }: { input: string }) => {
	return (
		<Container>
			<ReactMarkdown remarkPlugins={[remarkParse, remarkGfm]}>
				{input}
			</ReactMarkdown>
		</Container>
	);
};

const Container = styled.div`
	font-size: 1.6rem;
	line-height: 1.8;
	word-wrap: break-word;
	pointer-events: none;

	width: 50%;
	padding: 4ch;
	overflow-y: scroll;

	li {
		margin-left: 2ch;
	}

	pre {
		padding: 1ch;
		font-size: 1.8rem;
		background-color: #f6f8fa;
	}

	blockquote {
		position: relative;
		padding-left: 2ch;
		border-left: 6px solid #eee;
	}

	table {
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		border-radius: 5px;
		text-align: center;
		padding: 10px;
		border-spacing: 0;
	}

	th,
	td {
		padding: 10px;
		&:not(:last-child) {
			border-right: 1px solid #d6d5d5;
		}
	}

	tr {
		&:not(:last-child) td {
			border-bottom: 1px solid #d6d5d5;
		}

		&:nth-child(odd) {
			background: #eee;
		}
	}

	th {
		padding-top: 0;
		font-size: 1.7rem;
		border-bottom: 1px solid #d6d5d5;
		background-color: #fff;
		color: var(--color-blue);
	}

	td {
		color: #686767;
	}

	a:any-link {
		color: var(--color-blue);
	}

	img {
		width: 80%;
		resize: both;
	}

	.task-list-item {
		list-style: none;
		margin-left: 0;
	}

	.task-list-item input {
		margin-right: 1ch;
	}
`;

export default Preview;
