/* eslint-disable @typescript-eslint/no-explicit-any */
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { LanguageSupport } from '@codemirror/language';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import axios from 'axios';
import { FileType, fileExtension, LanguageType } from '../constants';

const langMap: Record<LanguageType, LanguageSupport> = {
  javascript: javascript({ jsx: true }),
  typescript: javascript({ jsx: true, typescript: true }),
  python: python(),
  cpp: cpp(),
};

export class CodeMirrorComponentProps {
  fileType!: FileType;

  content!: string;

  onChange!: (txt: string) => void;

  onSave!: () => void;
}

/**
 * Create a Python program with stdio enabled only.
 */
export function CodeMirrorComponent(props: CodeMirrorComponentProps) {
  const { onChange, onSave, content, fileType } = props;
  const [inputData, setInputData] = useState('');
  const [outputData, setOutputData] = useState('');
  const [errored, setErrored] = useState(false);

  const [runButtonDisabled, setRunButtonDisabled] = useState(false);
  const [saveButtonDisabled, setSaveButtonDisabled] = useState(false);

  const runProgramHandler = async (e: any) => {
    e.preventDefault();
    setRunButtonDisabled(true);
    const formData = new FormData();
    // https://stackoverflow.com/questions/68841019/how-to-send-array-and-formdata-with-axios-vue/68842393#68842393
    // This works for single element need to test for arrays.

    const tmpFileName = `tmp.${fileExtension[fileType]}`;
    formData.append('sources', new Blob([content]), tmpFileName);
    formData.append('inputs', new Blob([inputData]), 'input.txt');
    formData.append('environment', 'python3');
    formData.append('mainFile', tmpFileName);
    try {
      const res = await axios.post(`api/program-executer/simple-execute`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const output = res.data.outputs[0];
      const { workspaceName } = res.data;
      if (output.returnCode === 0) {
        // Success
        const outputFileName = output.outputFile;
        const fileRes = await axios.get(`api/program-executer/workspaceName/${workspaceName}/files/${outputFileName}`, {
          responseType: 'text',
        });
        setOutputData(fileRes.data);
        setErrored(false);
      } else if (output.returnCode === 124) {
        // timeout
        setOutputData('Program Execution Timedout');
        setErrored(true);
      } else {
        // Failure
        const erorFileName = output.errorFile;
        const fileRes = await axios.get(`api/program-executer/workspaceName/${workspaceName}/files/${erorFileName}`, {
          responseType: 'text',
        });
        setOutputData(fileRes.data);
        setErrored(true);
      }
    } catch (err) {
      setOutputData('Error Occurred');
      setErrored(true);
    }
    setRunButtonDisabled(false);
  };

  return (
    <div>
      <CodeMirror
        className="code-mirror"
        value={content}
        extensions={[langMap[fileType as LanguageType]]}
        onChange={onChange}
      />
      <div className="d-flex">
        <Form.Group className="mb-3 mx-3 w-50" controlId="input-form-control">
          <Form.Label>Input data</Form.Label>
          <Form.Control as="textarea" rows={5} onChange={(e) => setInputData(e.target.value)} />
        </Form.Group>
        <Form.Group className={`mb-3  w-50 ${errored ? 'error' : ''}`} controlId="output-form-control">
          <Form.Label>{errored ? 'Error Data' : 'Output data'}</Form.Label>
          <Form.Control as="textarea" rows={5} value={outputData} readOnly disabled />
        </Form.Group>
      </div>
      <Button className="mx-2 my-2" disabled={runButtonDisabled} onClick={runProgramHandler}>
        Run
      </Button>
      <Button
        className="mx-2 my-2"
        disabled={saveButtonDisabled}
        onClick={async () => {
          setSaveButtonDisabled(true);
          await onSave();
          setSaveButtonDisabled(false);
        }}
      >
        Save
      </Button>
    </div>
  );
}
