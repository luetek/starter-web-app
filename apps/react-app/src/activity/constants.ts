export enum FileType {
  PYTHON = 'python',
  MARKDOWN = 'markdown',
  JAVASCRIPT = 'javascript',
  TYPESCRIPT = 'typescript',
  CPP = 'cpp',
  TEXT = 'text',
}
export function getTypeFromFileName(fileName: string): FileType {
  const ext = fileName.split('.')[1];
  if (ext === 'py') return FileType.PYTHON;
  if (ext === 'md') return FileType.MARKDOWN;
  if (ext === 'txt') return FileType.TEXT;
  throw new Error(`Unknown extension ${fileName}`);
}
export const fileExtension: Record<FileType, string> = {
  markdown: 'md',
  python: 'py',
  typescript: 'ts',
  javascript: 'js',
  cpp: 'cpp',
  text: 'txt',
};

export type LanguageType = 'javascript' | 'typescript' | 'python' | 'cpp';

export const envMap: Record<LanguageType, string> = {
  python: 'python3',
  typescript: 'ts-node18',
  javascript: 'node18',
  cpp: 'gxx11',
};
