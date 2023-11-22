/**
 * 下载文件
 */
type Download = (argument: Record<"href" | "fileName", string>) => void;
export const download: Download = ({ href, fileName }) => {
	const link = document.createElement("a");
	link.href = href;
	link.download = fileName;
	link.click();
};

/**
 * 获取 Blob 的 base64
 */
export const blobToBase64 = (blob: Blob) => {
	return new Promise((resolve, reject) => {
		try {
			const reader = new FileReader();
			reader.onloadend = function () {
				resolve(reader.result);
			};
			reader.readAsDataURL(blob);
		} catch (e) {
			reject(e);
		}
	});
};
