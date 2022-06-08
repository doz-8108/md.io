import React, {
	useContext,
	createContext,
	ReactNode,
	useEffect,
	useRef,
	useState,
	useCallback
} from "react";
import { getDownloadURL } from "firebase/storage";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

import useStorage from "hooks/useStorage";
import { pushEmojiAlert, pushErrorAlert, pushPromiseAlert } from "utils/alert";
import { Cursor } from "types/cusor";
import useProject from "hooks/useProject";
import { useAuth } from "./auth";
import { Participant } from "types/participant";

const { fromTextArea } = require("codemirror");

interface PresetType {
	initialVal: string;
	handleChange: (input: string, pos: Cursor) => void;
}

type FormatStr = "BOLD" | "ITALIC" | "LINE_THROUGH";
type ToList = "UNORDERED" | "ORDERED" | "CODE" | "CHECK" | "QUOTE";
type Participants = Participant[];

const SOCKET = process.env.REACT_APP_SOCKET || "ws://localhost:3001";

const ACTIONS = {
	JOIN: "JOIN",
	SYNC: "SYNC",
	LEAVE: "LEAVE",
	FULL: "FULL",
	QUERY: "QUERY"
};

const formatStr: { [key in FormatStr as string]: string } = {
	ITALIC: "*",
	BOLD: "**",
	LINE_THROUGH: "~~"
};

const formatList: { [key in ToList as string]: string } = {
	UNORDERED: "- ",
	ORDERED: "1. ",
	CODE: "    ",
	CHECK: "- [ ] ",
	QUOTE: "> "
};

const listRegex: { [key in ToList as string]: RegExp } = {
	UNORDERED: new RegExp(/^-\s(?!\[[Xx\s]\])/),
	ORDERED: new RegExp(/^\d+\.\s/),
	CODE: new RegExp(/^\s{4}/),
	CHECK: new RegExp(/^-\s\[[Xx\s]\]\s/),
	QUOTE: new RegExp(/>(\s?)/)
};

const CodeMirrorContext = createContext<any>(undefined);

export const CodeMirrorProvider = ({ children }: { children: ReactNode }) => {
	const id = window.location.href.match(/\/projects\/(.+)/)?.[1];
	const { user } = useAuth();
	const { setMembers } = useProject();
	const { uploadImage } = useStorage();
	const navigate = useNavigate();

	const socket = useRef<any>(null);
	const editorRoot = useRef<HTMLTextAreaElement>(null);
	const [preset, setPreset] = useState<PresetType | null>(null);
	const [codeMirror, setCodeMirror] =
		useState<ReturnType<typeof fromTextArea>>(null);

	const setValue = useCallback(
		(val: string) => {
			try {
				if (codeMirror) codeMirror.setValue(val);
			} catch (error) {}
		},
		[codeMirror]
	);

	const setCursor = useCallback(
		(pos: Cursor) => {
			if (codeMirror) {
				codeMirror.setCursor(pos);
				codeMirror.focus();
			}
		},
		[codeMirror]
	);

	const getPrefixByLine = (
		line = "",
		cb: (
			result: string,
			orderedListItem: { value: number; numInList: string } | null
		) => void
	) => {
		// if is not code (4 spaces) trim the space in the begining of the string
		if (!line.match(listRegex["CODE"])) line = line.replace(/^\s+/g, "");
		const prefixTypes = Object.keys(listRegex);
		let result = "",
			orderedListItem = null;

		for (let i = 0; i < prefixTypes.length; i++) {
			const type = prefixTypes[i];
			const isMatch = line.match(listRegex[type]);

			if (isMatch) {
				result = formatList[type];

				if (type === "ORDERED") {
					orderedListItem = {
						value: Number(isMatch[0].split(".")[0]),
						numInList: isMatch[0]
					};
				}
			}
		}

		return cb(result, orderedListItem);
	};

	useEffect(() => {
		if (!socket.current) {
			socket.current = io(SOCKET, {
				transports: ["websocket"],
				reconnectionDelay: 2000,
				reconnectionAttempts: 10,
				timeout: 600000 // this socket will be disconnected if idle for 10mins
			});
		} else socket.current.connect();

		socket.current.on("connect_error", () => {
			if (window.location.pathname !== "/projects") {
				navigate({ pathname: "/projects", search: "?error=connection_failed" });
			}
		});

		socket.current.on(ACTIONS.FULL, () => {
			if (window.location.pathname !== "/projects") {
				navigate({
					pathname: "/projects",
					search: "?error=room_full"
				});
			}
		});

		socket.current.on(
			ACTIONS.JOIN,
			({ m, n }: { m: Participants; n: Partial<Participant> }) => {
				setMembers(m);
				if (n.uid !== user?.uid)
					pushEmojiAlert({
						icon: "👋",
						message: `${n.name} joined the project`
					});
			}
		);
	}, [setMembers, user?.uid]);

	const isSelectBottomToTop = (anchor: any, head: any) => {
		if (
			anchor.line > head.line ||
			(anchor.line === head.line && anchor.ch > head.ch)
		)
			[anchor, head] = [head, anchor];
		return [anchor, head];
	};

	useEffect(() => {
		const editor = document.querySelector(
			".CodeMirror.cm-s-default"
		) as HTMLElement;
		if (editorRoot.current && preset && !editor) {
			const cm = fromTextArea(editorRoot.current, {
				mode: "markdown",
				lineNumbers: true,
				configureMouse: () => ({
					addNew: false
				}),
				extraKeys: {
					Enter: "newlineAndIndentContinueMarkdownList",
					Tab: "indentMore"
				}
			});

			cm.on("change", (cmObj: any, changes: any) => {
				if (changes.origin !== "setValue") {
					const input = cmObj.doc.getValue();
					const { line, ch } = cmObj.doc.getCursor();

					socket.current.emit(ACTIONS.SYNC, {
						projectId: id,
						uid: user?.uid,
						pos: { line, ch },
						doc: input
					});

					preset.handleChange(input, { line, ch });
				}
			});

			cm.setValue(preset?.initialVal);
			setCodeMirror(cm);
		}
	}, [id, preset, user?.uid]);

	const insertURL = useCallback(
		(type: "URL" | "IMG", url = "") => {
			const urlStr =
				type === "URL"
					? "[message](**URL)"
					: `![alt. text](${url || "image URL"})`;
			const cursor = codeMirror.getCursor();

			if (codeMirror.somethingSelected()) {
				let { anchor, head } = codeMirror.listSelections()[0];
				[anchor, head] = isSelectBottomToTop(anchor, head);

				codeMirror.replaceRange(urlStr, head);
			} else {
				codeMirror.replaceRange(urlStr, cursor);
				codeMirror.setCursor({
					line: cursor.line,
					ch: cursor.ch + urlStr.length
				});
			}

			codeMirror.focus();
		},
		[codeMirror]
	);

	// for drag & drop image upload
	useEffect(() => {
		if (codeMirror) {
			const editor = document.querySelector(
				".CodeMirror.cm-s-default"
			) as HTMLElement;
			if (editor) {
				const editorClasses = editor.classList;
				const container = document.querySelector(".editor") as HTMLDivElement;

				const dragOver = (e: DragEvent) => {
					e.preventDefault();
					const target = e.target as HTMLElement;
					if (container.contains(target)) editorClasses.add("drop-hover");
					else editorClasses.remove("drop-hover");
				};

				const dragLeave = (e: DragEvent) => {
					if (container === (e.target as HTMLDivElement))
						editorClasses.remove("drop-hover");
				};

				const drop = async (e: DragEvent) => {
					e.preventDefault();
					editorClasses.remove("drop-hover");
					const image = e.dataTransfer?.files[0];

					const reader = new FileReader();
					reader.onload = () => {
						if (!reader.result) return;

						const result = reader.result as string;
						const ext = image?.type.split("/")[1];
						pushPromiseAlert(
							uploadImage(result, ext || "").then(async res => {
								const url = await getDownloadURL(res.ref);
								insertURL("IMG", url);
							}),
							{
								loading: "Uploading image...",
								success: "Image uploaded!",
								error: "Service is not available"
							}
						);
					};

					if (image && image.type.startsWith("image/")) {
						reader.readAsDataURL(image);
					} else pushErrorAlert("Un-supported file format!");
				};

				window.addEventListener("dragover", dragOver, true);
				window.addEventListener("dragleave", dragLeave);
				window.addEventListener("drop", drop);

				return () => {
					window.removeEventListener("dragover", dragOver, true);
					window.removeEventListener("dragleave", dragLeave);
					window.removeEventListener("drop", drop);
				};
			}
		}
	}, [codeMirror, insertURL, uploadImage]);

	const addLineBreak = useCallback(() => {
		let { line } = codeMirror.getCursor();
		const currentLine = codeMirror.getLine(line);
		let ch = currentLine.length;

		if (codeMirror.somethingSelected()) {
			let { anchor, head } = codeMirror.listSelections()[0];
			[anchor, head] = isSelectBottomToTop(anchor, head);

			line = head.line;
			ch = codeMirror.getLine(head.line).length;
		}

		codeMirror.replaceRange("\n&nbsp;  \n", {
			line,
			ch
		});

		codeMirror.setCursor({ line: line + 2, ch: 0 });
		codeMirror.focus();
	}, [codeMirror]);

	const formatText = useCallback(
		(type: FormatStr) => {
			const match = formatStr[type];
			const offset = match.length;
			const cursor = codeMirror.getCursor();

			if (codeMirror.somethingSelected()) {
				// ** CASE: HAVE SELECTED TEXT
				const selection = codeMirror.listSelections()[0];
				let { anchor, head } = selection; /* cursor positions on two sides */

				// if select from bottom to top => switch their positions
				[anchor, head] = isSelectBottomToTop(anchor, head);

				// Situation 1. combine the same match
				const leftPos = { line: anchor.line, ch: anchor.ch - 2 };
				const rightPos = {
					line: head.line,
					ch: head.ch + 2
				};

				const strInLeft = codeMirror.getRange(leftPos, anchor);
				const strInRight = codeMirror.getRange(head, rightPos);
				let leftMatch = false,
					rightMatch = false;

				if (match === "*") {
					leftMatch = strInLeft.match(/^[^*]?\*{1}$/) !== null;
					rightMatch = strInRight.match(/^\*{1}(?!\*)/) !== null;
				} else {
					leftMatch = strInLeft === match;
					rightMatch = strInRight === match;
				}

				if (leftMatch && rightMatch) {
					// i.e selected 'a' in "**123**|a|**123**" => '**123a123**'
					codeMirror.replaceRange(
						codeMirror.getRange(anchor, head),
						leftPos,
						rightPos
					);
				} else if (leftMatch) {
					// i.e selected 'a' in "**123**|a|" => '**123a**'
					codeMirror.replaceRange(
						`${codeMirror.getRange(anchor, head)}${match}`,
						leftPos,
						head
					);
				} else if (rightMatch) {
					// i.e selected 'a' in "|a|**123**" => '**a123**'
					codeMirror.replaceRange(
						`${match}${codeMirror.getRange(anchor, head)}`,
						anchor,
						rightPos
					);
				} else {
					codeMirror.replaceSelection(
						`${match}${codeMirror.getRange(anchor, head)}${match}`
					);
				}
			} else {
				// ** CASE: NO SELECTION
				// i.e cursor in "abc**|**" => "abc|"
				const { line, ch } = cursor;

				const leftMatch =
					codeMirror.getRange({ line, ch: ch - offset }, cursor) === match;
				const rightMatch =
					codeMirror.getRange(cursor, {
						line,
						ch: ch + offset
					}) === match;

				if (leftMatch && rightMatch) {
					codeMirror.replaceRange(
						"",
						{ line, ch: ch - offset },
						{ line, ch: ch + offset }
					);
					codeMirror.setCursor({ line, ch: ch - offset });
				} else {
					// i.e cursor in "ab|cd"=> "ab**|**cd"
					codeMirror.replaceRange(match + match, { line, ch: ch });
					codeMirror.setCursor({ line, ch: ch + offset });
				}
			}
			codeMirror.focus();
		},
		[codeMirror]
	);

	const toList = useCallback(
		(type: ToList) => {
			let prefix = formatList[type];
			const offset = prefix.length;
			const cursor = codeMirror.getCursor();
			const { line, ch } = cursor;

			// ** CASE: HAVE SELECTED TEXT
			if (codeMirror.somethingSelected()) {
				const selection = codeMirror.listSelections()[0];
				let { anchor, head } = selection;
				[anchor, head] = isSelectBottomToTop(anchor, head);
				let count = 1;

				// continue counting if previous line is in the ordered list
				// i.e 99. xxxx\n 100. xxxx
				const prevLine = codeMirror.getLine(anchor.line - 1) || "";
				getPrefixByLine(prevLine, (_, orderListItem) => {
					if (orderListItem) count = orderListItem.value + 1;
				});

				for (let i = anchor.line; i <= head.line; i++) {
					// switch from one list type to another
					// i.e 1. xxxx => [ ] xxxx
					const currentLine = codeMirror.getLine(i);
					let replaceOffset = 0,
						isOrderedList = false;
					getPrefixByLine(currentLine, (result, orderedListItem) => {
						replaceOffset = result.length;
						if (orderedListItem) {
							replaceOffset = orderedListItem.numInList.length;
							isOrderedList = true;
						}
					});

					codeMirror.replaceRange(
						"",
						{
							line: i,
							ch: 0
						},
						{ line: i, ch: replaceOffset }
					);

					// line alredy have a same prefix => cancel it
					// i.e apply ordered list to 1. xxxx => xxxx
					const replacement =
						(type === "ORDERED" && isOrderedList) ||
						currentLine.match(listRegex[type])
							? ""
							: type === "ORDERED"
							? `${count++}. `
							: prefix;

					codeMirror.replaceRange(replacement, {
						line: i,
						ch: 0
					});
				}

				codeMirror.setCursor({
					line: head.line,
					ch: codeMirror.getLine(head.line).length
				});
			} else {
				// ** CASE: NO SELECTED TEXT
				const currentLine = codeMirror.getLine(cursor.line);
				let havePrefix = false;

				getPrefixByLine(currentLine, (result, orderedListItem) => {
					if (result) {
						havePrefix = true;
						if (type === "ORDERED" && orderedListItem)
							// previous line is an item of ordered list
							prefix = `${Number(orderedListItem.value) + 1}. `;
					}
				});

				if (havePrefix) {
					codeMirror.replaceRange("\n", {
						line: line,
						ch: currentLine.length
					});
					codeMirror.setCursor({ line: line + 1, ch: ch + offset });
				}

				codeMirror.replaceRange(prefix, {
					line: havePrefix ? line + 1 : cursor.line,
					ch: 0
				});
			}

			codeMirror.focus();
		},
		[codeMirror]
	);

	const insertTable = useCallback(() => {
		const tableStr = "\n|  |  |\n|--|--|\n|  |  |";
		const cursor = codeMirror.getCursor();

		if (codeMirror.somethingSelected()) {
			let { anchor, head } = codeMirror.listSelections()[0];
			[anchor, head] = isSelectBottomToTop(anchor, head);

			codeMirror.replaceRange(tableStr, head);
		} else {
			codeMirror.replaceRange(tableStr, cursor);
		}
		codeMirror.setCursor({ line: cursor.line + 1, ch: 2 });
		codeMirror.focus();
	}, [codeMirror]);

	return (
		<CodeMirrorContext.Provider
			value={{
				setPreset,
				codeMirror,
				editorRoot,
				formatText,
				toList,
				insertTable,
				insertURL,
				addLineBreak,
				setValue,
				setCursor,
				socket,
				ACTIONS
			}}
		>
			{children}
		</CodeMirrorContext.Provider>
	);
};

export const useCMContext = () => {
	const ctx = useContext(CodeMirrorContext);
	if (!ctx) throw new Error("No CM context is available!");
	return ctx;
};
