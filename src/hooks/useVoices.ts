import { useEffect, useState } from "react";
import useVoice, { State, Operations as _Operations } from "./useVoice";
import { Audio } from "../utils/Audio";

type ReturnUseVoice = {
	[T in keyof ReturnType<typeof useVoice> as T extends
		| "stream"
		| "voice"
		| "audioUrl"
		? never
		: T]: ReturnType<typeof useVoice>[T];
};

const StateReflect: Record<keyof TOperations, State> = {
	start: State.recording,
	pause: State.pause,
	resume: State.recording,
	stop: State.stop,
};

type TOperations = typeof _Operations;

export default (): ReturnUseVoice => {
	const [state, setState] = useState<State>(State.inactive);
	const userMedia = useVoice({ type: "getUserMedia" });
	const displayMedia = useVoice({ type: "getDisplayMedia" });

	const operation = (key: keyof TOperations) => {
		return () => {
			console.info("userMedia.state: ", userMedia.state, displayMedia.state);
			if (
				!_Operations[key].validate(userMedia.state) ||
				!_Operations[key].validate(displayMedia.state)
			) {
				return;
			}
			setState(StateReflect[key]);
			userMedia[`${key}Record`]();
			displayMedia[`${key}Record`]();
		};
	};

	const effect = async () => {
		if (!userMedia || !displayMedia) {
			return;
		}
		if (state === State.inactive) {
			setState(State.ready);
		}
		const uVoice = userMedia.voice,
			dVoice = displayMedia.voice;
		if (!uVoice || uVoice?.size === 0 || !dVoice || dVoice?.size === 0) {
			return;
		}
		if (!userMedia.stream || !displayMedia.stream) {
			return;
		}

		const audio = new Audio([uVoice, dVoice]);
		audio.play();
		audio.download();
	};
	useEffect(() => {
		effect();
	});

	return {
		state,
		startRecord: operation("start"),
		pauseRecord: operation("pause"),
		resumeRecord: operation("resume"),
		stopRecord: operation("stop"),
		uploadRecord: () => void 0,
	};
};
