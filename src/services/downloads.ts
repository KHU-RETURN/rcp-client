export type DownloadMode = 'stream' | 'blob';

interface SaveFilePickerOptionsLike {
  suggestedName: string;
}

interface WritableFileLike {
  write: (chunk: Uint8Array) => Promise<void> | void;
  close: () => Promise<void> | void;
  abort?: (reason?: unknown) => Promise<void> | void;
}

interface FileHandleLike {
  createWritable: () => Promise<WritableFileLike>;
}

interface AnchorLike {
  href: string;
  download: string;
  click: () => void;
  remove: () => void;
}

export interface DownloadEnvironment {
  showSaveFilePicker?: (options: SaveFilePickerOptionsLike) => Promise<FileHandleLike>;
  createObjectURL: (blob: Blob) => string;
  revokeObjectURL: (url: string) => void;
  createAnchor: () => AnchorLike;
  appendAnchor: (anchor: AnchorLike) => void;
}

type WindowWithSaveFilePicker = Window & {
  showSaveFilePicker?: (options: SaveFilePickerOptionsLike) => Promise<FileHandleLike>;
};

function browserDownloadEnvironment(): DownloadEnvironment {
  const browserWindow =
    typeof window === 'undefined' ? undefined : (window as WindowWithSaveFilePicker);

  return {
    showSaveFilePicker: browserWindow?.showSaveFilePicker?.bind(browserWindow),
    createObjectURL: (blob) => URL.createObjectURL(blob),
    revokeObjectURL: (url) => URL.revokeObjectURL(url),
    createAnchor: () => document.createElement('a'),
    appendAnchor: (anchor) => document.body.appendChild(anchor as unknown as Node),
  };
}

export async function saveResponseAsFile(
  response: Response,
  filename: string,
  env: DownloadEnvironment = browserDownloadEnvironment(),
): Promise<DownloadMode> {
  if (response.body && env.showSaveFilePicker) {
    const handle = await env.showSaveFilePicker({ suggestedName: filename });
    const writable = await handle.createWritable();
    await writeResponseBody(response.body, writable);
    return 'stream';
  }

  const blob = await response.blob();
  const url = env.createObjectURL(blob);
  const anchor = env.createAnchor();
  anchor.href = url;
  anchor.download = filename;

  try {
    env.appendAnchor(anchor);
    anchor.click();
  } finally {
    anchor.remove();
    env.revokeObjectURL(url);
  }

  return 'blob';
}

async function writeResponseBody(
  body: ReadableStream<Uint8Array>,
  writable: WritableFileLike,
): Promise<void> {
  const reader = body.getReader();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        await writable.write(value);
      }
    }
  } catch (error) {
    await writable.abort?.(error);
    throw error;
  }
  await writable.close();
}
