import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { LanguageSupport } from '@codemirror/language';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import { RootState, useAppDispatch } from '../../../store';

type LanguageType = 'javascript' | 'typescript' | 'python' | 'cpp';
interface CodeEditorProps {
  language: LanguageType;
  srcFiles: [string, string][];
  callback: (value: string, index: number) => void;
}
const langMap: Record<LanguageType, LanguageSupport> = {
  javascript: javascript({ jsx: true }),
  typescript: javascript({ jsx: true, typescript: true }),
  python: python(),
  cpp: cpp(),
};

/**
 * Create a Python program with stdio enabled only.
 */
export function ProgramFileCreate() {
  const [source, setSource] = useState('');
  const [inputData, setInputData] = useState('');
  const [outputData, setOutputData] = useState('');

  const dispatch = useAppDispatch();
  const activityCollection = useSelector((state: RootState) => state.activityCollection.current);
  const { activityId, languageType } = useParams();

  if (!activityCollection || !languageType) return 'Loading';

  const activity = activityCollection.activities.filter((act) => act.id === parseInt(activityId as string, 10))[0];
  return (
    <div>
      <div>Create {languageType} program</div>
      <CodeMirror
        className="code-mirror"
        value={source}
        extensions={[langMap[languageType as LanguageType]]}
        onChange={(data: string) => setSource}
      />
      <div className="d-flex">
        <Form.Group className="mb-3 mx-3 w-50" controlId="exampleForm.ControlTextarea1">
          <Form.Label>Input data</Form.Label>
          <Form.Control as="textarea" rows={5} onChange={(e) => setInputData(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3  w-50" controlId="exampleForm.ControlTextarea1">
          <Form.Label>Output data</Form.Label>
          <Form.Control as="textarea" rows={5} value={outputData} readOnly disabled />
        </Form.Group>
      </div>
      <Button className="mx-2 my-2"> Run </Button>
      <Button className="mx-2 my-2"> Save </Button>
    </div>
  );
}
