import { Link, useParams } from 'react-router-dom';
import Accordion from 'react-bootstrap/Accordion';
import { ActivityDto } from '@luetek/common-models';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { RootState } from '../../store';
import { getActivityCollectionThunk } from '../activity-collection-slice';

export function ActivityCollectionViewPage() {
  const params = useParams();
  const { id } = params;
  const activityCollection = useSelector((state: RootState) => state.activityCollection);
  useEffect(() => {
    if (id) getActivityCollectionThunk(parseInt(id, 10));
  }, [id]);
  // sort section and their order
  if (activityCollection.activities)
    activityCollection.activities.sort((a, b) => {
      if (a.sectionId !== b.sectionId) {
        return a.sectionId - b.sectionId;
      }
      return a.orderId - b.orderId;
    });

  const categorizedActivities: Record<string, ActivityDto[]> = {};
  const { activities } = activityCollection;
  const { sections } = activityCollection;
  console.log(activityCollection);
  // eslint-disable-next-line no-restricted-syntax
  if (sections)
    for (const sec of sections) {
      const res = activities.filter((activity) => activity.sectionId === sec.sectionId);
      categorizedActivities[sec.title] = res;
    }

  if (!activityCollection) return <div>Loading ...</div>;
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
      <Accordion>
        {Object.entries(categorizedActivities).map((entry) => {
          const section = entry[0];
          const sectionItems = entry[1];
          return (
            <Accordion.Item eventKey={section} key={section}>
              <Accordion.Header>{section}</Accordion.Header>
              <Accordion.Body>
                {sectionItems.map((item) => (
                  <Accordion key={item.id}>
                    <Accordion.Item eventKey={item.id.toString()}>
                      <Accordion.Header>
                        <span className="text-primary">
                          {item.sectionId}.{item.orderId} &nbsp;&nbsp;&nbsp;
                        </span>
                        <Link
                          style={{ textDecoration: 'none' }}
                          to={`/collections/${activityCollection.id}/activities/${item.id}`}
                        >
                          {item.title}
                        </Link>
                      </Accordion.Header>
                      <Accordion.Body>{item.description}</Accordion.Body>
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
