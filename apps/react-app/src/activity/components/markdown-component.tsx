import { StoragePathDto } from '@luetek/common-models';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import Cherry from 'cherry-markdown';
import * as echarts from 'echarts';
import axios from 'axios';

import 'cherry-markdown/dist/cherry-markdown.css';
import { CherryEditorOptions } from 'cherry-markdown/types/cherry';
import Button from 'react-bootstrap/Button';

import Modal from 'react-bootstrap/Modal';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
// eslint-disable-next-line @typescript-eslint/no-var-requires, import/extensions
const MathJax = require('mathjax/es5/tex-svg.js');

interface MarkdownComponentProps {
  parent: StoragePathDto;
  content: string;
  isEditor: boolean;
  // eslint-disable-next-line react/require-default-props
  name?: string;
  onSave: (filename: string, content: string | undefined) => void;
}

// TODO:: Add error handling modals
// https://github.com/tuanjs/react-cherry-markdown
// Use the above component to build this component.
export function MarkdownComponent(props: MarkdownComponentProps) {
  const { parent, content, isEditor, name, onSave } = props;
  const [fileName, setFileName] = useState(name);
  const [fileNameDialog, setFileNameDialog] = useState(false);
  const [cherryInstance, setCherryInstance] = useState<Cherry | null>(null);
  const initialized = useRef(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const editorOption: CherryEditorOptions = isEditor
    ? { autoSave2Textarea: true, defaultModel: 'edit&preview', showFullWidthMark: true, showSuggestList: true }
    : { defaultModel: 'previewOnly', keepDocumentScrollAfterInit: true };
  useEffect(() => {
    if (!initialized.current) {
      // Use this trick to initialise only once.
      // https://react.dev/blog/2022/03/29/react-v18#new-strict-mode-behaviors
      // https://stackoverflow.com/questions/60618844/react-hooks-useeffect-is-called-twice-even-if-an-empty-array-is-used-as-an-ar
      initialized.current = true;
      const saveMenu = Cherry.createMenuHook('Save', {
        onClick: () => {
          if (!fileName) {
            setFileNameDialog(true);
            return;
          }
          onSave(fileName, (cherryInstance as unknown as Cherry).getMarkdown());
        },
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
      <Modal show={fileNameDialog} onHide={() => setFileNameDialog(false)} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <InputGroup.Text>file Name</InputGroup.Text>
            <Form.Control
              aria-label="filename without the extension"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                e.preventDefault();
                setFileName(e.target.value);
              }}
            />
            <InputGroup.Text>.md</InputGroup.Text>
          </InputGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setFileNameDialog(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setFileNameDialog(false);
              onSave(fileName as string, cherryInstance?.getMarkdown());
            }}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      <div style={{ height: '80vh', width: '100%' }} ref={editorRef} />
    </div>
  );
}
