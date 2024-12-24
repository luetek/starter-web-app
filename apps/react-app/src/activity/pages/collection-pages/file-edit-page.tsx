import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { RootState, useAppDispatch } from '../../../store';
import { MarkdownComponent } from '../../components/markdown-component';
import { getActivityCollectionThunk } from '../../activity-collection-slice';

export function FileEditPage() {
  const [content, setContent] = useState('');
  const dispatch = useAppDispatch();
  const activityCollection = useSelector((state: RootState) => state.activityCollection.current);
  const { activityId, fileId } = useParams();

  const activity = activityCollection?.activities.filter(
    (act) => act.id === (activityId ? parseInt(activityId, 10) : null)
  )[0];

  const file = activity?.parent?.children?.filter((ff) => ff.id === (fileId ? parseInt(fileId, 10) : null))[0];

  useEffect(() => {
    const loadFile = async () => {
      if (file) {
        const res = await axios.get(`api/storage/${file?.parentId}/stream/${file?.name}`, { responseType: 'stream' });
        let str = '';
        const chunks = res.data;
        for await (const chunk of chunks) {
          str += chunk;
        }
        setContent(str);
        console.log(str);
      }
    };
    loadFile();
  }, [file]);

  if (!activity || !file || !content) {
    return <div> Loading ...</div>;
  }

  if (file?.name.endsWith('.md')) {
    return (
      <div>
        <div>Edit Markdown</div>
        <MarkdownComponent
          content={content}
          name={file.name}
          parent={activity.parent}
          isEditor
          onSave={async (name, cnts) => {
            if (!cnts) {
              throw new Error('Content is empty');
            }
            const formData = new FormData();
            formData.append('file', new Blob([cnts]), file.name);
            // TODO:: Better error handling
            await axios.put(`api/storage/${file.id}/upload`, formData, {
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
  return <div>File Edit Page</div>;
}
