import { Navigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useMemo } from 'react';
import { ReadingActivity } from '@luetek/common-models';
import { RootState, useAppDispatch } from '../../../store';
import { loadFile } from '../../file-storage-slice';
import { MarkdownComponent } from '../../components/markdown-component';

export function ReadingActivityContentIndexView() {
  const { activityId } = useParams();
  const activityCollection = useSelector((state: RootState) => state.activityCollection.current);

  const activity = useMemo(
    () => activityCollection?.activities?.filter((act) => act.id === parseInt(activityId as string, 10))[0],
    [activityCollection, activityId]
  );
  const activitySpec = activity?.activitySpec as ReadingActivity;

  const file = useMemo(
    () => activity?.parent?.children?.filter((ff) => ff.id === activitySpec.files[0].id)[0],
    [activity, activitySpec]
  );
  console.log(file);
  if (!file) return 'Loading...';

  return <Navigate to={`pages/${file.id}`} />;
}

export function ReadingActivityContentView() {
  const { pageId, activityId } = useParams();
  const dispatch = useAppDispatch();
  const activityCollection = useSelector((state: RootState) => state.activityCollection.current);
  const files = useSelector((state: RootState) => state.fileCache.files);

  const activity = useMemo(
    () => activityCollection?.activities?.filter((act) => act.id === parseInt(activityId as string, 10))[0],
    [activityCollection, activityId]
  );

  const file = useMemo(
    () => activity?.parent?.children?.filter((ff) => ff.id === (pageId ? parseInt(pageId, 10) : null))[0],
    [activity, pageId]
  );

  // One time load only
  const fileDataInitial = useMemo(() => {
    if (!file) {
      throw new Error('Unknown file');
    }

    const ff = files.filter((f) => f.fileId === file.id)[0];
    return ff?.data || '';
  }, [file, files]);

  useEffect(() => {
    const asyncLoadFile = async () => {
      if (!file) {
        throw new Error('Unknown file');
      }
      await dispatch(loadFile(file)).unwrap();
    };
    asyncLoadFile();
  }, [file, dispatch]); // We want to load when file change occurs in the url.

  if (!fileDataInitial || !activity) return <div>Loading ...</div>;
  return (
    <div className="reading-actvity-content-view">
      <MarkdownComponent parent={activity?.parent} content={fileDataInitial} isEditor={false} />
    </div>
  );
}
