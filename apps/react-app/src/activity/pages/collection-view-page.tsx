import { Link, useParams } from 'react-router-dom';
import Accordion from 'react-bootstrap/Accordion';
import { ActivityDto } from '@luetek/common-models';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { RootState, useAppDispatch } from '../../store';
import { getActivityCollectionThunk } from '../activity-collection-slice';

export function ActivityCollectionViewPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();

  const activityCollection = useSelector((state: RootState) => state.activityCollection.current);
  useEffect(() => {
    if (id) dispatch(getActivityCollectionThunk(parseInt(id, 10)));
  }, [dispatch, id]);

  if (!activityCollection) return <div>Loading ...</div>;

  const idToActivityMap: Record<number, ActivityDto> = {};
  const { activities } = activityCollection;
  const activitySection = activityCollection.sections;

  // eslint-disable-next-line no-restricted-syntax
  if (activities)
    for (const activity of activities) {
      idToActivityMap[activity.id] = activity;
    }

  return (
    <div>
      <div className="course-intro">
        <h1>{activityCollection.title}</h1>
        {activityCollection.keywords.map((keyword) => (
          <span className="text-primary" key={keyword}>
            {keyword}
            {'| '}
          </span>
        ))}
        <p className="mt-3">{activityCollection.description}</p>
        <span>Authors: </span>
        {activityCollection.authors.map((author) => (
          <span className="text-info" key={author}>
            {author},{' '}
          </span>
        ))}
      </div>

      <h2>Course Content</h2>
      {!activities || activities.length === 0 ? <div> No Course Content</div> : null}
      <Accordion>
        {activitySection.map((entry, sectionIndex) => {
          const section = entry.title;
          const { sectionId, orderedActivities } = entry;

          return (
            <Accordion.Item eventKey={sectionId.toString()} key={sectionId}>
              <Accordion.Header>{section}</Accordion.Header>
              <Accordion.Body>
                {orderedActivities.map((activityId, activityIndex) => (
                  <Accordion key={activityId}>
                    <Accordion.Item eventKey={activityId.toString()}>
                      <Accordion.Header>
                        <span className="text-primary">
                          {sectionIndex + 1}.{activityIndex + 1} &nbsp;&nbsp;&nbsp;
                        </span>
                        <Link
                          style={{ textDecoration: 'none' }}
                          to={`/collections/${activityCollection.id}/activities/${activityId}/view`}
                        >
                          {idToActivityMap[activityId].title}
                        </Link>
                      </Accordion.Header>
                      <Accordion.Body>{idToActivityMap[activityId].description}</Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                ))}
              </Accordion.Body>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </div>
  );
}
