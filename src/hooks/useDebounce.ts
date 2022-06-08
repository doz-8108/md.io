import React, { useEffect, useState } from "react";

const useDebounce = (val: string, delay = 500) => {
	const [debouncedVal, setDebouncedVal] = useState("");

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedVal(val), delay);
		// clear last timer
		return () => clearTimeout(timer);
	}, [val, delay]);

	return debouncedVal;
};

export default useDebounce;
