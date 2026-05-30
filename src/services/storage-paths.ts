interface StorageObjectLike {
  name: string;
  content_type: string;
  size_bytes: number;
  last_modified: string;
}

export interface FolderBrowserEntry {
  kind: 'folder';
  name: string;
  prefix: string;
  sizeBytes: number;
  objectCount: number;
  lastModified: string;
}

export interface FileBrowserEntry<T extends StorageObjectLike = StorageObjectLike> {
  kind: 'file';
  name: string;
  object: T;
}

export type ObjectBrowserEntry<T extends StorageObjectLike = StorageObjectLike> =
  | FolderBrowserEntry
  | FileBrowserEntry<T>;

export function encodeObjectKey(key: string): string {
  return key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

export function getUploadObjectKey(file: File): string {
  return file.webkitRelativePath || file.name;
}

export function normalizeObjectPrefix(prefix: string): string {
  const normalized = prefix.replace(/^\/+/, '');
  if (normalized && !normalized.endsWith('/')) {
    return `${normalized}/`;
  }
  return normalized;
}

export function buildArchiveFilename(prefix: string, containerName: string): string {
  const normalized = normalizeObjectPrefix(prefix);
  const base = normalized
    ? normalized.replace(/\/+$/, '').split('/').filter(Boolean).at(-1)
    : containerName;
  return `${base || 'objects'}.zip`;
}

export function buildObjectBrowserEntries<T extends StorageObjectLike>(
  objects: T[],
  prefix: string,
): ObjectBrowserEntry<T>[] {
  const normalizedPrefix = normalizeObjectPrefix(prefix);
  const folders = new Map<string, FolderBrowserEntry>();
  const files: FileBrowserEntry<T>[] = [];

  for (const object of objects) {
    if (!object.name.startsWith(normalizedPrefix)) continue;

    const relativeName = object.name.slice(normalizedPrefix.length);
    if (!relativeName) continue;

    const slashIndex = relativeName.indexOf('/');
    if (slashIndex >= 0) {
      const folderName = relativeName.slice(0, slashIndex);
      const folderPrefix = `${normalizedPrefix}${folderName}/`;
      const current = folders.get(folderPrefix);
      if (current) {
        current.sizeBytes += object.size_bytes || 0;
        current.objectCount += 1;
        if (object.last_modified > current.lastModified) {
          current.lastModified = object.last_modified;
        }
      } else {
        folders.set(folderPrefix, {
          kind: 'folder',
          name: folderName,
          prefix: folderPrefix,
          sizeBytes: object.size_bytes || 0,
          objectCount: 1,
          lastModified: object.last_modified,
        });
      }
      continue;
    }

    files.push({
      kind: 'file',
      name: relativeName,
      object,
    });
  }

  return [
    ...Array.from(folders.values()).sort((a, b) => a.name.localeCompare(b.name)),
    ...files.sort((a, b) => a.name.localeCompare(b.name)),
  ];
}
