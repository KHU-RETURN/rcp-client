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

export interface PreparedResponseDownload {
  ready: Promise<void>;
  save: (response: Response) => Promise<DownloadMode>;
}

type WindowWithSaveFilePicker = Window & {
  showSaveFilePicker?: (options: SaveFilePickerOptionsLike) => Promise<FileHandleLike>;
};

type FilePickerResult = {
  handle?: FileHandleLike;
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

export function prepareResponseFileDownload(
  filename: string,
  env: DownloadEnvironment = browserDownloadEnvironment(),
): PreparedResponseDownload {
  const pickerResult = openSaveFilePicker(filename, env);

  return {
    ready: pickerResult ? pickerResult.then(() => undefined) : Promise.resolve(),
    save: (response) => saveResponseAsFile(response, filename, env, pickerResult),
  };
}

async function saveResponseAsFile(
  response: Response,
  filename: string,
  env: DownloadEnvironment,
  pickerResult?: Promise<FilePickerResult>,
): Promise<DownloadMode> {
  const filePicker = await pickerResult;
  if (response.body && filePicker?.handle) {
    const writable = await filePicker.handle.createWritable();
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

function openSaveFilePicker(
  filename: string,
  env: DownloadEnvironment,
): Promise<FilePickerResult> | undefined {
  if (!env.showSaveFilePicker) {
    return undefined;
  }

  try {
    return env.showSaveFilePicker({ suggestedName: filename }).then(
      (handle) => ({ handle }),
      (error) => {
        if (isUserAbortError(error)) {
          throw error;
        }
        return {};
      },
    );
  } catch (error) {
    if (isUserAbortError(error)) {
      throw error;
    }
    return Promise.resolve({});
  }
}

function isUserAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
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
