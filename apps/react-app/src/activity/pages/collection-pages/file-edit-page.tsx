import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { RootState } from '../../../store';
import { MarkdownFileCreateOrUpdate } from './markdown-file-create-or-update';
import { ProgramFileCreateOrUpdate } from './program-file-create-or-update';

export function FileEditPage() {
  const activityCollection = useSelector((state: RootState) => state.activityCollection.current);
  const { activityId, fileId } = useParams();

  const activity = activityCollection?.activities.filter(
    (act) => act.id === (activityId ? parseInt(activityId, 10) : null)
  )[0];

  const file = activity?.parent?.children?.filter((ff) => ff.id === (fileId ? parseInt(fileId, 10) : null))[0];

  if (!activity || !file) {
    return <div> Loading ...</div>;
  }

  if (file?.name.endsWith('.md')) {
    return <MarkdownFileCreateOrUpdate />;
  }

  if (file?.name.endsWith('.py')) {
    return <ProgramFileCreateOrUpdate />;
  }
  return <div>File Editor Not Available</div>;
}
