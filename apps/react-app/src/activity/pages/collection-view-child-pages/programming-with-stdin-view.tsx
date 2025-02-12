/* eslint-disable @typescript-eslint/no-explicit-any */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSelector } from 'react-redux';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { LanguageSupport } from '@codemirror/language';
import { useEffect, useMemo, useState } from 'react';
import { faSquareCheck } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import {
  ActivityDto,
  ProgrammingActivitySubmissionWithStdioCheck,
  ProgrammingActivityWithStdioCheck,
  SubmissionDto,
  SubmissionStatus,
} from '@luetek/common-models';
import axios, { AxiosResponse } from 'axios';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { RootState, useAppDispatch } from '../../../store';
import { MarkdownComponent } from '../../components/markdown-component';
import { getTypeFromFileName, LanguageType } from '../../constants';
import { loadFile } from '../../file-storage-slice';

const langMap: Record<LanguageType, LanguageSupport> = {
  javascript: javascript({ jsx: true }),
  typescript: javascript({ jsx: true, typescript: true }),
  python: python(),
  cpp: cpp(),
};

async function streamToString(fileRes: AxiosResponse) {
  let str = '';
  const chunks = fileRes.data;
  for await (const chunk of chunks) {
    str += chunk;
  }
  return str;
}

export function SubmissionOutputView(props: { submission: SubmissionDto }) {
  const { submission } = props;
  const [fileContent, setFileContent] = useState<Map<string, string>[]>([]);
  const spec = submission.submissionSpec as ProgrammingActivitySubmissionWithStdioCheck;

  const specResults = spec.results || [];

  useEffect(() => {
    const loadResultFileData = async () => {
      const resultContent = await Promise.all(
        specResults.map(async (result) => {
          const map = new Map<string, string>();
          if (result.returnCode === 0) {
            const userOutputFileContentRes = await axios.get(
              `api/storage/${submission.parentId}/stream/${result.userOutputFile}`,
              {
                responseType: 'stream',
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              }
            );
            map.set('usrOutput', await streamToString(userOutputFileContentRes));
          } else {
            const errorOutputFileContentRes = await axios.get(
              `api/storage/${submission.parentId}/stream/${result.errorFile}`,
              {
                responseType: 'stream',
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              }
            );
            map.set('errorOutput', await streamToString(errorOutputFileContentRes));
          }

          const testOutputFileContentRes = await axios.get(
            `api/storage/${submission.parentId}/stream/${result.testOutputFile}`,
            {
              responseType: 'stream',
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          map.set('testOutput', await streamToString(testOutputFileContentRes));
          return map;
        })
      );
      setFileContent(resultContent);
    };

    loadResultFileData();
  }, [submission]);

  if (submission.status !== SubmissionStatus.DONE || fileContent.length === 0) return 'LOADING';
  console.log(specResults);
  return (
    <div>
      <Tabs id="submission-tabs" className="mb-3">
        {specResults.map((testResult, index) => (
          <Tab key={testResult.inputFile} eventKey={testResult.inputFile} title={`Test ${index + 1}`}>
            <div>
              <div>Correct Output</div>
              <div>{fileContent[index].get('testOutput')}</div>
            </div>
            <div>
              <div> {testResult.returnCode === 0 ? 'User Output' : 'Error Output'}</div>
              <div>
                {testResult.returnCode === 0
                  ? fileContent[index].get('usrOutput')
                  : fileContent[index].get('errorOutput')}
              </div>
            </div>
          </Tab>
        ))}
      </Tabs>
    </div>
  );
}
export function UserCodeSubmissionResult(props: { submissions: SubmissionDto[] }) {
  const { submissions } = props;
  const [key, setKey] = useState(submissions[0]?.id);
  return (
    <div>
      <Tabs id="submission-tabs" activeKey={key} onSelect={(k: any) => setKey(k)} className="mb-3">
        {submissions.map((sub, index) => (
          <Tab key={sub.id} eventKey={sub.id} title={`Submission ${index + 1}`}>
            <SubmissionOutputView submission={sub} />
          </Tab>
        ))}
      </Tabs>
    </div>
  );
}

export function ProgrammingWithStdinView(props: { activity: ActivityDto }) {
  const dispatch = useAppDispatch();
  const [userSourceCode, setUserSourceCode] = useState('');
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
  const [submissions, setSubmissions] = useState<SubmissionDto[]>([]);
  const files = useSelector((state: RootState) => state.fileCache.files);
  const userId = useSelector((state: RootState) => state.user.user?.id);
  const { activity } = props;

  const activitySpec = activity?.activitySpec as ProgrammingActivityWithStdioCheck;

  const descFile = useMemo(
    () =>
      activitySpec ? activity?.parent?.children?.filter((ff) => ff.name === activitySpec.descriptionFile)[0] : null,
    [activity, activitySpec]
  );

  const srcFile = useMemo(
    () =>
      activitySpec ? activity?.parent?.children?.filter((ff) => ff.name === activitySpec.inputSrcMainFile)[0] : null,
    [activity, activitySpec]
  );

  const descData = useMemo(
    () => (descFile ? files.filter((ff) => ff.fileId === descFile.id)[0]?.data : null) || '',
    [descFile, files]
  );
  const srcData = useMemo(
    () => (srcFile ? files.filter((ff) => ff.fileId === srcFile.id)[0]?.data : null) || '',
    [srcFile, files]
  );

  // TODO:: dont reload submission with done status
  useEffect(() => {
    const loadSubmissions = async () => {
      const res = await axios.get(`api/submissions`, {
        data: { userId: 1, activityId: activity.id },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(res.data);
      setSubmissions(res.data as SubmissionDto[]);
      setTimeout(loadSubmissions, 500000);
    };
    loadSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmitHandler = async (e: any) => {
    e.preventDefault();
    setSubmitButtonDisabled(true);
    const formData = new FormData();
    // https://stackoverflow.com/questions/68841019/how-to-send-array-and-formdata-with-axios-vue/68842393#68842393
    // This works for single element need to test for arrays.

    formData.append('inputs', new Blob([userSourceCode]), 'main.py');
    formData.append('userId', '1');
    formData.append('environment', 'PYTHON3');
    formData.append('activityId', activity.id.toString());
    formData.append('inputSrcMainFile', 'main.py');
    try {
      const resSubmitted = await axios.post(`api/submissions/programming-activity-stdin`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const res = await axios.get(`api/submissions`, {
        data: { userId: 1, activityId: activity.id },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSubmissions(res.data as SubmissionDto[]);
    } catch (err) {
      // ignore
    }
    setSubmitButtonDisabled(false);
  };

  useEffect(() => {
    const asyncLoadFile = async () => {
      if (!descFile || !srcFile) {
        throw new Error('Unknown file');
      }
      await dispatch(loadFile(descFile)).unwrap();
      await dispatch(loadFile(srcFile)).unwrap();
    };
    asyncLoadFile();
  }, [descFile, srcFile, dispatch]); // We want to load when file change occurs in the url.

  if (!activity || !srcFile) return 'Loading';

  return (
    <div className="programming-actvity-content-view d-flex flex-row gap-2">
      <div>
        <h3>
          {activity.title}&nbsp;
          <FontAwesomeIcon icon={faSquareCheck} color={Math.random() ? '#22b24c' : 'grey'} />
          &nbsp;
        </h3>
        <div className="p-3 my-3">
          <p>{activity.description}</p>
          <div>
            <MarkdownComponent parent={activity?.parent} content={descData} isEditor={false} />
          </div>
        </div>
      </div>

      <div className="w-100">
        <CodeMirror
          className="code-mirror"
          value={srcData}
          extensions={[langMap[getTypeFromFileName(srcFile?.name) as LanguageType]]}
          onChange={(s) => setUserSourceCode(s)}
        />
        <div className="d-flex">
          <Button className="m-2" disabled={submitButtonDisabled} onClick={(e) => onSubmitHandler(e)}>
            Submit
          </Button>
        </div>

        <UserCodeSubmissionResult submissions={submissions} />
      </div>
    </div>
  );
}
