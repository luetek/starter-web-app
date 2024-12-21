import { StoragePathDto } from '@luetek/common-models';
import { useEffect, useRef } from 'react';
import Cherry from 'cherry-markdown';
import * as echarts from 'echarts';
import axios from 'axios';

import 'cherry-markdown/dist/cherry-markdown.css';
import { CherryEditorOptions } from 'cherry-markdown/types/cherry';
// eslint-disable-next-line @typescript-eslint/no-var-requires, import/extensions
const MathJax = require('mathjax/es5/tex-svg.js');

interface MarkdownComponentProps {
  parent: StoragePathDto;
  content: string;
  isEditor: boolean;
}

export function MarkdownComponent(props: MarkdownComponentProps) {
  const { parent, content, isEditor } = props;
  let cherryInstance: Cherry | null = null;
  const editorRef = useRef<HTMLDivElement>(null);

  const editorOption: CherryEditorOptions = isEditor
    ? { autoSave2Textarea: true, defaultModel: 'edit&preview', showFullWidthMark: true, showSuggestList: true }
    : { defaultModel: 'previewOnly', keepDocumentScrollAfterInit: true };
  useEffect(() => {
    if (!cherryInstance) {
      console.log('Initialsed Cherry Markdown');

      // eslint-disable-next-line react-hooks/exhaustive-deps
      cherryInstance = new Cherry({
        el: editorRef.current as HTMLDivElement,
        value: content,
        locale: 'en_US',
        externals: {
          echarts,
          MathJax,
        },
        engine: {
          syntax: {
            table: { enableChart: true },
            header: { anchorStyle: 'none' },
          },
        },
        editor: editorOption,
        toolbars: {
          toolbar: [
            'bold',
            'italic',
            {
              strikethrough: ['strikethrough', 'underline', 'sub', 'sup', 'ruby'],
            },
            'size',
            '|',
            'color',
            'header',
            '|',
            'ol',
            'ul',
            'checklist',
            'panel',
            'justify',
            'detail',
            {
              insert: ['image', 'audio', 'video', 'link', 'hr', 'br', 'code', 'inlineCode', 'table'],
            },
          ],
          toc: false,
        },
        callback: {
          urlProcessor: (url, srcType) => {
            if (url.startsWith('https://') || url.startsWith('http://')) return url;
            return `api/storage/${parent.id}/stream/${url}`;
          },
          fileUpload: async (file, callback) => {
            const formData = new FormData();
            formData.append('file', file);
            const res = await axios.post(`api/storage/${parent.id}/upload`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
            const storagePath = res.data as StoragePathDto;
            callback(storagePath.name, { name: storagePath.name, width: '100%' });
          },
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
