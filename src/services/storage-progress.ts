export interface UploadProgressSnapshot {
  loadedBytes: number;
  totalBytes: number;
  percent: number;
  currentFileIndex: number;
  fileCount: number;
}

export function calculateUploadProgress(
  files: File[],
  currentFileIndex: number,
  currentFileLoadedBytes: number,
): UploadProgressSnapshot {
  const totalBytes = files.reduce((sum, file) => sum + Math.max(0, file.size || 0), 0);
  const completedBytes = files
    .slice(0, Math.max(0, currentFileIndex))
    .reduce((sum, file) => sum + Math.max(0, file.size || 0), 0);
  const currentFileSize = Math.max(0, files[currentFileIndex]?.size || 0);
  const currentLoaded = Math.min(Math.max(0, currentFileLoadedBytes), currentFileSize);
  const loadedBytes = Math.min(completedBytes + currentLoaded, totalBytes);

  return {
    loadedBytes,
    totalBytes,
    percent: totalBytes > 0 ? Math.round((loadedBytes / totalBytes) * 100) : 0,
    currentFileIndex,
    fileCount: files.length,
  };
}
