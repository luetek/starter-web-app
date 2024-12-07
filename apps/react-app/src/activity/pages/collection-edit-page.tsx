import { useParams } from 'react-router-dom';

export function ActivityCollectionEditPage() {
  const params = useParams();
  return <div>Activity Collection Edit Page {params.id}</div>;
}
