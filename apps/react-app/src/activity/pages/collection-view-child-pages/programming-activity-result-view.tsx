import { useEffect, useMemo, useState } from 'react';
import { faSquareCheck } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import {
  ActivityDto,
  ProgrammingActivitySubmissionWithStdioCheck,
  ProgrammingActivityWithStdioCheck,
  StoragePathDto,
  SubmissionDto,
  SubmissionStatus,
} from '@luetek/common-models';
import axios, { AxiosResponse } from 'axios';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../../store';
import { loadFile } from '../../file-storage-slice';

async function streamToString(fileRes: AxiosResponse) {
  let str = '';
  const chunks = fileRes.data;
  for await (const chunk of chunks) {
    str += chunk;
  }
  return str;
}

export function SubmissionOutputView(props: { submission: SubmissionDto; inputTestFiles: StoragePathDto[] }) {
  const { submission, inputTestFiles } = props;
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
export function ProgrammingActivityResultView(props: { activity: ActivityDto }) {
  const dispatch = useAppDispatch();
  const userId = useSelector((state: RootState) => state.user.user?.id);
  const [submissions, setSubmissions] = useState<SubmissionDto[]>([]);
  const { activity } = props;
  console.log(userId);
  const activitySpec = activity?.activitySpec as ProgrammingActivityWithStdioCheck;
  const [key, setKey] = useState(submissions[0]?.id);
  const testFiles = useMemo(
    () =>
      activitySpec && activity.parent && activity.parent.children
        ? activity.parent.children.filter((ff) => activitySpec.testInputFiles.includes(ff.name))
        : [],
    [activity, activitySpec]
  );

  useEffect(() => {
    const asyncLoadFile = async () => {
      const res = testFiles.map((file) => dispatch(loadFile(file)).unwrap());
      await Promise.all(res);
    };
    asyncLoadFile();
  }, [testFiles, dispatch]); // We want to load when file change occurs in the url.

  // TODO:: dont reload submission with done status
  useEffect(() => {
    const loadSubmissions = async () => {
      const res = await axios.get(`api/submissions`, {
        data: { userId, activityId: activity.id },
      });
      console.log(res.data);
      setSubmissions(res.data as SubmissionDto[]);
    };
    loadSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const reload = async () => {
      const newSubs = await Promise.all(
        submissions.map(async (submission) => {
          if (submission.status === SubmissionStatus.DONE) {
            return submission;
          }
          const res = await axios.get(`api/submissions/${submission.id}`);
          return res.data as SubmissionDto;
        })
      );

      if (newSubs.length > 0) {
        setSubmissions(newSubs);
      }
      console.log('reload called');
      setTimeout(reload, 1000);
    };

    reload();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Tabs id="submission-tabs" activeKey={key} onSelect={(k: any) => setKey(k)} className="mb-3">
        {submissions.map((sub, index) => (
          <Tab key={sub.id} eventKey={sub.id} title={`Submission ${index + 1}`}>
            <SubmissionOutputView submission={sub} inputTestFiles={testFiles} />
          </Tab>
        ))}
      </Tabs>
    </div>
  );
}
