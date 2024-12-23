import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MarkdownComponent } from '../../components/markdown-component';
import { RootState, useAppDispatch } from '../../../store';
import { getActivityCollectionThunk } from '../../activity-collection-slice';

export function MarkdownFileCreate() {
  const dispatch = useAppDispatch();
  const activityCollection = useSelector((state: RootState) => state.activityCollection.current);
  const { activityId } = useParams();

  if (!activityCollection) return 'Loading';

  const activity = activityCollection.activities.filter((act) => act.id === parseInt(activityId as string, 10))[0];

  return (
    <div>
      <div>Create markdown create</div>
      <MarkdownComponent
        content="Some default content for testing"
        parent={activity.parent}
        isEditor
        onSave={async (name, content) => {
          if (!content) {
            throw new Error('Content is empty');
          }
          const formData = new FormData();
          formData.append('file', new Blob([content]), `${name}.md`);
          // TODO:: Better error handling
          await axios.post(`api/storage/${activity.parent.id}/upload`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          // reload the data
          await dispatch(getActivityCollectionThunk(activityCollection.id));
        }}
      />
    </div>
  );
}
