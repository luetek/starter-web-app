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

export function ProgrammingWithStdinView(props: { activity: ActivityDto }) {
  const dispatch = useAppDispatch();
  const [userSourceCode, setUserSourceCode] = useState('');
  const files = useSelector((state: RootState) => state.fileCache.files);

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
        <div className="d-flex justify-content-end">
          <Button className="m-2">Run</Button>
        </div>
        <div className="d-flex justify-content-end">
          <Button className="m-2">Submit</Button>
        </div>
      </div>
    </div>
  );
}
