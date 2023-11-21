import Crunker, { ExportedCrunkerAudio } from "crunker";

export const ArrayBufferToAudioBuffer = (
	buffer: ArrayBuffer
): Promise<AudioBuffer> => {
	return new Promise((resolve, reject) => {
		try {
			const audioContext = new AudioContext();
			const audioSource = audioContext.createBufferSource();
			audioContext.decodeAudioData(buffer, (buffer) => {
				audioSource.buffer = buffer;
				audioSource.connect(audioContext.destination);
				return resolve(buffer);
			});
		} catch {
			reject();
		}
	});
};

declare interface Data extends ExportedCrunkerAudio {
	audioBuffer: AudioBuffer | null;
}

export class Audio {
	private crunker = new Crunker();
	private blobs: [Blob, Blob] | null = null;
	private data: Partial<Data> = {};

	constructor(blobs: [Blob, Blob]) {
		this.blobs = blobs;
	}

	private async blobToAudioBuffer() {
		const buffers = await Promise.all(
			this.blobs!.map((blob) => blob.arrayBuffer())
		);
		const audioBuffers = await Promise.all(
			buffers.map((buffer) => ArrayBufferToAudioBuffer(buffer))
		);
		const audioBuffer = this.crunker.mergeAudio(audioBuffers);
		const data = {
			audioBuffer,
			...this.crunker.export(audioBuffer),
		};
		this.data = data;
	}

	private async preCheck() {
		if (!this.data.audioBuffer) {
			await this.blobToAudioBuffer();
		}
	}

	async play() {
		await this.preCheck();
		this.crunker.play(this.data.audioBuffer!);
	}

	async download() {
		await this.preCheck();
		this.crunker.download(this.data.blob!);
	}
}
