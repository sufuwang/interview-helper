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
