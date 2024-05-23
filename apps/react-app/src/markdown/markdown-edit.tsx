import MarkdownEditor from '@uiw/react-markdown-editor';
export function MarkdownEdit() {
  const mdStr = `# This is a H1  \n## This is a H2  \n###### This is a H6`;

  return <MarkdownEditor value={mdStr} onChange={(value, viewUpdate) => {}} />;
}
