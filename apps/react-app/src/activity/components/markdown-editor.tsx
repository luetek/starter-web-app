import { StoragePathDto } from '@luetek/common-models';
import { useEffect, useRef } from 'react';
import Cherry from 'cherry-markdown';

import 'cherry-markdown/dist/cherry-markdown.css';

interface MarkdownEditorProps {
  parent: StoragePathDto;
  content: string;
}
export function MarkdownEditor(props: MarkdownEditorProps) {
  const { parent } = props;
  let cherryInstance: Cherry | null = null;
  const editorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!cherryInstance) {
      console.log('Initialsed Cherry Markdown');
      // eslint-disable-next-line react-hooks/exhaustive-deps
      cherryInstance = new Cherry({
        el: editorRef.current as HTMLDivElement,
        value: '# welcome to cherry editor!',
        locale: 'en_US',
        callback: {
          urlProcessor: (url, srcType) => {
            if (url.startsWith('https://') || url.startsWith('http://')) return url;
            return parent.pathUrl + url;
          },
          fileUpload: (file, callback) => {},
        },
      });
    }
  }, []);
  return (
    <div>
      <div style={{ height: '80vh', width: '100%' }} ref={editorRef} />
    </div>
  );
}
