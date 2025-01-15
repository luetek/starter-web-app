/* eslint-disable @typescript-eslint/no-explicit-any */
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { LanguageSupport } from '@codemirror/language';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import InputGroup from 'react-bootstrap/InputGroup';
import { RootState, useAppDispatch } from '../../../store';
import { cleanUpFile, saveFileContent } from '../../file-storage-slice';
import { getActivityCollectionThunk } from '../../activity-collection-slice';

type LanguageType = 'javascript' | 'typescript' | 'python' | 'cpp';

const langMap: Record<LanguageType, LanguageSupport> = {
  javascript: javascript({ jsx: true }),
  typescript: javascript({ jsx: true, typescript: true }),
  python: python(),
  cpp: cpp(),
};

const langExt: Record<LanguageType, string> = {
  javascript: 'js',
  typescript: 'ts',
  python: 'py',
  cpp: 'cpp',
};

/**
 * Create a Python program with stdio enabled only.
 */
export function ProgramFileCreate() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [inputData, setInputData] = useState('');
  const [outputData, setOutputData] = useState('');
  const [fileName, setFileName] = useState('');
  const [errored, setErrored] = useState(false);
  const [runButtonDisabled, setRunButtonDisabled] = useState(false);
  const [saveButtonDisabled, setSaveButtonDisabled] = useState(false);
  const [fileNameDialog, setFileNameDialog] = useState(false);

  const activityCollection = useSelector((state: RootState) => state.activityCollection.current);
  const files = useSelector((state: RootState) => state.fileStorageReducer.files);

  const { activityId, languageType } = useParams();
  const tmpKey = `//tmp/${activityId}/program-file-${languageType}`;
  const file = useMemo(
    () =>
      files.filter((f) => f.fileName === tmpKey)[0] || {
        data: '',
        fileName: tmpKey,
        lastAccessed: Date.now(),
      },
    [files, tmpKey]
  );

  if (!activityCollection || !languageType) return 'Loading';

  const activity = activityCollection.activities.filter((act) => act.id === parseInt(activityId as string, 10))[0];

  const onSaveHandler = async (e: any) => {
    e.preventDefault();
    setSaveButtonDisabled(true);
    setSaveButtonDisabled(false);
  };

  const runProgramHandler = async (e: any) => {
    e.preventDefault();
    setRunButtonDisabled(true);
    console.log('handler called');
    const formData = new FormData();
    // https://stackoverflow.com/questions/68841019/how-to-send-array-and-formdata-with-axios-vue/68842393#68842393
    // This works for single element need to test for arrays.
    formData.append('sources', new Blob([file.data]), 'temp.py');
    formData.append('inputs', new Blob([inputData]), 'input.txt');
    formData.append('environment', 'python3');
    formData.append('mainFile', 'temp.py');
    try {
      const res = await axios.post(`api/program-executer/simple-execute`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(res);
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
      console.log(err);
      setOutputData('Error Occurred');
      setErrored(true);
    }
    setRunButtonDisabled(false);
  };

  const onSave = async () => {
    if (!file.data) {
      throw new Error('Content is empty');
    }
    setFileNameDialog(false);
    const formData = new FormData();
    formData.append('file', new Blob([file.data]), `${fileName}.${langExt[languageType as LanguageType]}`);
    // TODO:: Better error handling
    const fileRes = await axios.post(`api/storage/${activity.parent.id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // reload the data
    await dispatch(getActivityCollectionThunk(activityCollection.id));
    await dispatch(cleanUpFile(tmpKey));
    navigate(`/activity-collections/${activityCollection.id}/activities/${activityId}/files/${fileRes.data.id}/edit`);
  };
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
            <InputGroup.Text>.{langExt[languageType as LanguageType]}</InputGroup.Text>
          </InputGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setFileNameDialog(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={onSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      <div>Create {languageType} program</div>
      <CodeMirror
        className="code-mirror"
        value={file.data}
        extensions={[langMap[languageType as LanguageType]]}
        onChange={(data: string) => {
          dispatch(saveFileContent({ data, fileName: tmpKey, lastAccessed: Date.now() }));
        }}
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
      <Button className="mx-2 my-2" disabled={saveButtonDisabled} onClick={() => setFileNameDialog(true)}>
        Save
      </Button>
    </div>
  );
}
