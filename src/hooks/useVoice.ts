import { useEffect, useState } from "react";
import { download } from "../utils/tools";

/**
 * getUserMedia: 麦克风声音
 * getDisplayMedia: 网页声音
 */
type Type = "getUserMedia" | "getDisplayMedia";
interface HookArgus {
	type: Type;
}

export enum State {
	inactive = "inactive",
	ready = "ready",
	recording = "recording",
	pause = "pause",
	stop = "stop",
}

export const Operations: Record<
	"start" | "pause" | "resume" | "stop",
	{
		validate(state: State): boolean;
		handler(
			handle: MediaRecorder,
			set: React.Dispatch<React.SetStateAction<State>>
		): void;
	}
> = {
	start: {
		validate(state: State) {
			return state === State.ready;
		},
		handler(handle, set) {
			set(State.recording);
			handle.start();
		},
	},
	pause: {
		validate(state) {
			return state === State.recording;
		},
		handler(handle, set) {
			set(State.pause);
			handle.pause();
		},
	},
	resume: {
		validate(state) {
			return state === State.pause;
		},
		handler(handle, set) {
			set(State.recording);
			handle.resume();
		},
	},
	stop: {
		validate(state) {
			return [State.pause, State.recording].includes(state);
		},
		handler(handle, set) {
			set(State.stop);
			handle.stop();
		},
	},
};
const getStreamHandle = async (type: Type) => {
	const stream = await navigator.mediaDevices[type]({
		audio: true,
	});
	return new MediaStream(stream.getAudioTracks());
};

export default ({ type }: HookArgus) => {
	const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>();
	const [state, setState] = useState<State>(State.inactive);
	const [voice, setVoice] = useState<Blob | null>();
	const [stream, setStream] = useState<MediaStream>();
	const [audioUrl, setAudioUrl] = useState("");

	const createHandle = async () => {
		if (mediaRecorder) {
			return;
		}
		const stream = await getStreamHandle(type);
		const handle = new MediaRecorder(stream);
		handle.ondataavailable = ({ data }: BlobEvent) => {
			setVoice(data);
		};
		handle.onstop = () => {
			setState(State.ready);
		};
		setMediaRecorder(handle);
		setState(State.ready);
		setStream(stream);
	};
	const operation = (key: keyof typeof Operations) => {
		const { validate, handler } = Operations[key];
		if (!mediaRecorder || !validate(state)) {
			return () => null;
		}
		return () => handler(mediaRecorder, setState);
	};
	const uploadRecord = () => {
		if (!audioUrl) {
			return;
		}
		download({ href: audioUrl, fileName: "example.webm" });
	};

	useEffect(() => {
		createHandle();
		return () => {
			if (!mediaRecorder) {
				return;
			}
			mediaRecorder.ondataavailable = null;
		};
	}, []);
	useEffect(() => {
		if (!voice) {
			return;
		}
		const blob = new Blob([voice], { type: "audio/webm; codecs=opus" });
		setVoice(null);
		setAudioUrl(window.URL.createObjectURL(blob));
	}, [voice]);

	return {
		state,
		voice,
		stream,
		audioUrl,
		startRecord: operation("start"),
		pauseRecord: operation("pause"),
		resumeRecord: operation("resume"),
		stopRecord: operation("stop"),
		uploadRecord,
	};
};
