import React, { useEffect } from "react";
import "codemirror/lib/codemirror";
import "codemirror/addon/edit/continuelist";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/markdown/markdown";
import "./index.css";

import { useCMContext } from "components/providers/code-mirror";

interface PropTypes {
	initialVal: string;
	handleChange: (param: string) => void;
}

const Editor = ({ initialVal, handleChange }: PropTypes) => {
	let { setPreset, editorRoot } = useCMContext();

    useEffect(() => {
        if(initialVal !== null)
            setPreset({
                initialVal,
                handleChange
            });
	}, [handleChange, initialVal, setPreset]);

	return (
		<div style={{ width: "50%" }} className="editor">
			<textarea ref={editorRoot} />
		</div>
	);
};

export default Editor;
