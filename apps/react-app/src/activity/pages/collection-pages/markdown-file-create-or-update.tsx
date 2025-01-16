/* eslint-disable react-hooks/exhaustive-deps */
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { MarkdownComponent } from '../../components/markdown-component';
import { RootState, useAppDispatch } from '../../../store';
import { getActivityCollectionThunk } from '../../activity-collection-slice';
import { saveFileContent } from '../../file-storage-slice';

export function MarkdownFileCreateOrUpdate() {
  const [fileName, setFileName] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const activityCollection = useSelector((state: RootState) => state.activityCollection.current);
  const files = useSelector((state: RootState) => state.fileStorageReducer.files);
  const { activityId, fileId } = useParams();

  const activity = activityCollection?.activities?.filter((act) => act.id === parseInt(activityId as string, 10))[0];
  const file = activity?.parent?.children?.filter((ff) => ff.id === (fileId ? parseInt(fileId, 10) : null))[0];

  const tmpKey = useMemo(() => {
    if (!fileId) return `//tmp/${activityId}/markdown-file`;
    return `//tmp/${activityId}/fileId-${fileId}`;
  }, [fileId, activityId]);

  const fileData = useMemo(
    () =>
      files.filter((f) => f.fileName === tmpKey)[0] || {
        data: '',
        fileName: tmpKey,
        lastAccessed: Date.now(),
        version: 0,
      },
    [tmpKey]
  );

  useEffect(() => {
    const loadFile = async () => {
      if (file) {
        const res = await axios.get(`api/storage/${file?.parentId}/stream/${file?.name}`, { responseType: 'stream' });
        let str = '';
        const chunks = res.data;
        for await (const chunk of chunks) {
          str += chunk;
        }
        dispatch(saveFileContent({ data: str, fileName: tmpKey, lastAccessed: Date.now(), version: file.version }));
      }
    };
    if (file) {
      setFileName(file.name);
      loadFile();
    }
  }, [file]);

  if (!activityCollection || !activity) return 'Loading';
  return (
    <div>
      <div>Create markdown create</div>
      <MarkdownComponent
        content={fileData.data}
        parent={activity.parent}
        fileNameRecieved={fileName}
        isEditor
        onChange={(txt) =>
          dispatch(
            saveFileContent({ data: txt, fileName: tmpKey, lastAccessed: Date.now(), version: fileData.version })
          )
        }
        onSave={async (filename, content) => {
          if (!content) {
            throw new Error('Content is empty');
          }
          const formData = new FormData();
          formData.append('file', new Blob([content]), filename);
          // TODO:: Better error handling
          const fileRes = fileId
            ? await axios.put(`api/storage/${fileId}/upload`, formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              })
            : await axios.post(`api/storage/${activity.parent.id}/upload`, formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              });

          // reload the data
          await dispatch(getActivityCollectionThunk(activityCollection.id));
          navigate(
            `/activity-collections/${activityCollection.id}/activities/${activityId}/files/${fileRes.data.id}/edit`
          );
        }}
      />
    </div>
  );
}
