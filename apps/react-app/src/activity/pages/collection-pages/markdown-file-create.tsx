import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { MarkdownComponent } from '../../components/markdown-component';
import { RootState } from '../../../store';

export function MarkdownFileCreate() {
  const activityCollection = useSelector((state: RootState) => state.activityCollection.current);
  const { activityId } = useParams();

  if (!activityCollection) return 'Loading';

  const activity = activityCollection.activities.filter((act) => act.id === parseInt(activityId as string, 10))[0];

  return (
    <div>
      <div>Create markdown create</div>
      <MarkdownComponent content="Some default content for testing" parent={activity.parent} isEditor />
    </div>
  );
}
