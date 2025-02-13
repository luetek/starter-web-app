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
import { ActivityDto, ProgrammingActivityWithStdioCheck } from '@luetek/common-models';
import axios from 'axios';
import { RootState, useAppDispatch } from '../../../store';
import { MarkdownComponent } from '../../components/markdown-component';
import { getTypeFromFileName, LanguageType } from '../../constants';
import { loadFile } from '../../file-storage-slice';
import { ProgrammingActivityResultView } from './programming-activity-result-view';

const langMap: Record<LanguageType, LanguageSupport> = {
  javascript: javascript({ jsx: true }),
  typescript: javascript({ jsx: true, typescript: true }),
  python: python(),
  cpp: cpp(),
};

export function ProgrammingWithStdinView(props: { activity: ActivityDto }) {
  const dispatch = useAppDispatch();
  const [userSourceCode, setUserSourceCode] = useState('');
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
  const files = useSelector((state: RootState) => state.fileCache.files);
  const userId = useSelector((state: RootState) => state.user.user?.id);
  const { activity } = props;
  console.log(userId);
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

  useEffect(() => {
    setUserSourceCode(srcData);
  }, [srcData]);

  const onSubmitHandler = async (e: any) => {
    e.preventDefault();
    if (!userId) {
      throw new Error('userId not defined');
    }
    setSubmitButtonDisabled(true);
    const formData = new FormData();
    // https://stackoverflow.com/questions/68841019/how-to-send-array-and-formdata-with-axios-vue/68842393#68842393
    // This works for single element need to test for arrays.

    formData.append('inputs', new Blob([userSourceCode]), 'main.py');
    formData.append('userId', userId?.toString());
    formData.append('environment', 'PYTHON3');
    formData.append('activityId', activity.id.toString());
    formData.append('inputSrcMainFile', 'main.py');
    try {
      await axios.post(`api/submissions/programming-activity-stdin`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
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
          value={userSourceCode}
          extensions={[langMap[getTypeFromFileName(srcFile?.name) as LanguageType]]}
          onChange={(s) => {
            setUserSourceCode(s);
            console.log(s);
          }}
        />
        <div className="d-flex">
          <Button className="m-2" disabled={submitButtonDisabled} onClick={(e) => onSubmitHandler(e)}>
            Submit
          </Button>
        </div>

        <ProgrammingActivityResultView activity={activity} />
      </div>
    </div>
  );
}
