import { StoragePathDto } from '@luetek/common-models';
import { useEffect, useRef, useState } from 'react';
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
  onSave: () => void;
  onChange: (txt: string, html: string) => void;
}

// TODO:: Add error handling modals
// https://github.com/tuanjs/react-cherry-markdown
// Use the above component to build this component.
export function MarkdownComponent(props: MarkdownComponentProps) {
  const { parent, content, isEditor, onSave, onChange } = props;
  const [callSaveFunction, setCallSaveFunction] = useState(false);
  const [cherryInstance, setCherryInstance] = useState<Cherry | null>(null);
  const initialized = useRef(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const editorOption: CherryEditorOptions = isEditor
    ? { autoSave2Textarea: true, defaultModel: 'edit&preview', showFullWidthMark: true, showSuggestList: true }
    : { defaultModel: 'previewOnly', keepDocumentScrollAfterInit: true };

  useEffect(() => {
    if (cherryInstance) cherryInstance.setMarkdown(content);
  }, [cherryInstance, content]);

  useEffect(() => {
    const fun = async () => {
      if (callSaveFunction) {
        await onSave();
        console.log('Save button Clicked');
        setCallSaveFunction(false);
      }
    };
    fun();
  }, [callSaveFunction, onSave]);

  useEffect(() => {
    if (!initialized.current) {
      // Use this trick to initialise only once.
      // https://react.dev/blog/2022/03/29/react-v18#new-strict-mode-behaviors
      // https://stackoverflow.com/questions/60618844/react-hooks-useeffect-is-called-twice-even-if-an-empty-array-is-used-as-an-ar
      initialized.current = true;
      const saveMenu = Cherry.createMenuHook('Save', {
        // eslint-disable-next-line func-names, object-shorthand
        onClick: () => setCallSaveFunction(true),
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setCherryInstance(
        new Cherry({
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
              'saveMenuName',
              {
                insert: ['image', 'audio', 'video', 'link', 'hr', 'br', 'code', 'inlineCode', 'table'],
              },
            ],
            customMenu: {
              saveMenuName: saveMenu,
            },
            toc: false,
          },
          event: {
            afterChange: onChange,
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
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div>
      <div style={{ height: '80vh', width: '100%' }} ref={editorRef} />
    </div>
  );
}
