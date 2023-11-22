import Crunker, { ExportedCrunkerAudio } from "crunker";

interface Data extends ExportedCrunkerAudio {
	audioBuffer: AudioBuffer | null;
}

// https://github.com/jaggad/crunker/blob/master/src/crunker.ts
export class Audio {
	private crunker = new Crunker();
	private blobs: [Blob, Blob] | null = null;
	private data: Partial<Data> = {};
	private initialed: boolean = false;

	constructor(blobs: [Blob, Blob]) {
		this.blobs = blobs;
	}

	private preCheck() {
		if (!this.initialed) {
			throw new Error("Please initialize firstly");
		}
	}

	async init() {
		const buffers = await this.crunker.fetchAudio(...this.blobs!);
		const audioBuffer = this.crunker.mergeAudio(buffers);
		this.data = Object.assign(
			{ audioBuffer },
			this.crunker.export(audioBuffer)
		);
		this.initialed = true;
	}

	play() {
		this.preCheck();
		this.crunker.play(this.data.audioBuffer!);
	}

	download() {
		this.preCheck();
		this.crunker.download(this.data.blob!);
	}

	get context() {
		this.preCheck();
		return this.data;
	}
}
