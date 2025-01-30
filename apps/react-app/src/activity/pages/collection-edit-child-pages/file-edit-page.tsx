/* eslint-disable react-hooks/exhaustive-deps */
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { MarkdownComponent } from '../../components/markdown-component';
import { RootState, useAppDispatch } from '../../../store';
import { getActivityCollectionThunk } from '../../activity-collection-slice';
import { loadFile, persistExistingFile, updateFileCacheContent } from '../../file-storage-slice';
import { CodeMirrorComponent } from '../../components/code-mirror-component';
import { FileType, getTypeFromFileName } from '../../constants';

export function FileEditPage() {
  const [reload, setReload] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const activityCollection = useSelector((state: RootState) => state.activityCollection.current);
  const files = useSelector((state: RootState) => state.fileCache.files);
  // fileType is optional param avaiable in create path
  const { activityId, fileId } = useParams();

  const activity = useMemo(
    () => activityCollection?.activities?.filter((act) => act.id === parseInt(activityId as string, 10))[0],
    [activityCollection, activityId]
  );

  const file = useMemo(
    () => activity?.parent?.children?.filter((ff) => ff.id === (fileId ? parseInt(fileId, 10) : null))[0],
    [activity, fileId]
  );

  const fileTypeSelected = useMemo(() => (file ? getTypeFromFileName(file.name) : null), [file]);
  // One time load only
  const fileDataInitial = useMemo(() => {
    if (!file) {
      throw new Error('Unknown file');
    }
    if (!reload) return '';
    const ff = files.filter((f) => f.fileId === file.id)[0];
    return ff?.data || '';
  }, [file, reload]);

  useEffect(() => {
    const asyncLoadFile = async () => {
      if (!file) {
        throw new Error('Unknown file');
      }
      await dispatch(loadFile(file)).unwrap();
      setReload(true);
    };
    asyncLoadFile();
  }, [file, reload]); // We want to load when file change occurs in the url.

  if (!activityCollection || !activity || !file) return 'Loading';

  // Does the actual saving of the fileName, assumes fileName is available.
  const onSaveHandler = async () => {
    const fileRes = await dispatch(persistExistingFile(file)).unwrap();
    // reload the data
    await dispatch(getActivityCollectionThunk(activityCollection.id));
    navigate(`/activity-collections/${activityCollection.id}/activities/${activityId}/files/${fileRes.id}/edit`);
  };

  return (
    <div>
      <div> {`Edit ${file.name}`} </div>
      {fileTypeSelected === FileType.MARKDOWN ? (
        <MarkdownComponent
          content={fileDataInitial}
          parent={activity.parent}
          isEditor
          onChange={(txt) => {
            dispatch(
              updateFileCacheContent({
                data: txt,
                fileId: file.id,
              })
            );
          }}
          onSave={onSaveHandler}
        />
      ) : null}
      {fileTypeSelected === 'python' ? (
        <CodeMirrorComponent
          content={fileDataInitial}
          fileType={fileTypeSelected}
          onSave={onSaveHandler}
          onChange={(txt) => {
            dispatch(
              updateFileCacheContent({
                data: txt,
                fileId: file.id,
              })
            );
          }}
        />
      ) : null}
    </div>
  );
}
