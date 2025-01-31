import { ActivityDto, ReadingActivity } from '@luetek/common-models';
import Form from 'react-bootstrap/Form';
import { Link, Outlet, useParams } from 'react-router-dom';

export function ReadingActivityView(props: { activity: ActivityDto }) {
  const { activity } = props;
  const { pageId } = useParams();
  const spec = activity.activitySpec as ReadingActivity;
  const { files } = spec;

  if (!files) return 'Loading';
  const currentPageId = parseInt(pageId || '-1', 10);
  const currentFileIndex = files.findIndex((ff) => ff.id === currentPageId);

  const prevFile = files[currentFileIndex - 1];
  const nextFile = files[currentFileIndex + 1];
  return (
    <div>
      <h2>{activity.title}</h2>
      <p>{activity.description}</p>
      {/* Render the actual content using the Outlet */}
      <div className="border rounded-3 p-2">
        <Outlet />
      </div>
      {/* Render the Pagination link */}
      <div className="d-flex justify-content-between">
        <ul className="pagination m-3 justify-content-center">
          <li className="page-item">
            <Link
              className={`page-link ${currentPageId === files[0].id ? 'disabled' : ''}`}
              to={`pages/${prevFile?.id}`}
            >
              Previous
            </Link>
          </li>
          {files.map((file, index) => (
            <li className="page-item" key={file.id}>
              <Link className={`page-link ${currentPageId === file.id ? 'active' : ''} `} to={`pages/${file.id}`}>
                {index}
              </Link>
            </li>
          ))}
          <li className="page-item">
            <Link
              className={`page-link ${currentPageId === files[files.length - 1].id ? 'disabled' : ''}`}
              to={`pages/${nextFile?.id}
              }`}
            >
              Next
            </Link>
          </li>
        </ul>
        <div className="d-flex align-self-center">
          <Form.Check.Input type="checkbox" checked={false} onChange={() => {}} />
          <span>&nbsp; Mark as Completed &nbsp;</span>
        </div>
      </div>
    </div>
  );
}
