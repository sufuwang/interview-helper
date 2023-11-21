import useVoices from "./hooks/useVoices";
import { Button } from "antd";

export default () => {
	const {
		startRecord,
		pauseRecord,
		resumeRecord,
		stopRecord,
		uploadRecord,
		state,
	} = useVoices();

	return (
		<>
			<Button onClick={startRecord}>start</Button>
			<Button onClick={pauseRecord}>pause</Button>
			<Button onClick={resumeRecord}>resume</Button>
			<Button onClick={stopRecord}>stop</Button>
			<Button onClick={uploadRecord}>upload</Button>
			<br />
			state = {state}
			<br />
			{/* <audio controls src={audioUrl}></audio> */}
		</>
	);
};
