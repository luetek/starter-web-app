import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActivityCollectionDto, ActivityDto, ActivityType } from '@luetek/common-models';
import { useEffect, useMemo, useState } from 'react';
import Accordion from 'react-bootstrap/esm/Accordion';
import Button from 'react-bootstrap/esm/Button';
import Offcanvas from 'react-bootstrap/esm/Offcanvas';
import { Outlet, Link, useParams } from 'react-router-dom';
import { faCheck, faCircleChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../store';
import { getActivityCollectionThunk } from '../activity-collection-slice';
import { ReadingActivityView } from './collection-view-child-pages/reading-activity-view';

function getSummaryStatus(activityId: number) {
  return false;
}

export function ActivityView(props: { activity: ActivityDto }) {
  const { activity } = props;
  if (!activity) return <div>Loading ...</div>;

  if (activity.activitySpec.type === ActivityType.READING_ACTIVITY) {
    return <ReadingActivityView activity={activity} />;
  }
  throw new Error(`Unknown type for post${activity.activitySpec.type}`);
}

export function ActivityViewPage() {
  const { id, activityId } = useParams();
  const dispatch = useAppDispatch();
  const activityCollection = useSelector((state: RootState) => state.activityCollection.current);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    if (id) dispatch(getActivityCollectionThunk(parseInt(id, 10)));
  }, [dispatch, id]);

  console.log();
  const activitiesMap = useMemo(
    () => new Map(activityCollection?.activities.map((act) => [act.id, act])),
    [activityCollection]
  );

  const currentActivity = activitiesMap.get(parseInt(activityId || '0', 10));

  if (!activityCollection || !activitiesMap || !currentActivity) return <div>Loading ...</div>;
  return (
    <div>
      <div className="d-flex flex-column">
        <div className="align-self-end">
          <Button variant="primary" onClick={handleShow} className="me-2">
            <FontAwesomeIcon icon={faCircleChevronLeft} /> &nbsp;{activityCollection.title}
          </Button>
          <Offcanvas show={show} onHide={handleClose} placement="end">
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>
                <Link to={`/collections/${activityCollection.id}`}>{activityCollection.title}</Link>
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Accordion>
                {Object.entries(activityCollection.sections).map((entry, sectionIndex) => {
                  const section = entry[0];
                  const sectionDetail = entry[1];

                  return (
                    <Accordion.Item eventKey={section} key={section}>
                      <Accordion.Header>{sectionDetail.title}</Accordion.Header>
                      <Accordion.Body className="sidebar-list">
                        {sectionDetail.orderedActivities.map((actId, activityIndex) => (
                          <div key={actId} className="d-flex">
                            <span className="text-primary">
                              {sectionIndex + 1}.{activityIndex + 1} &nbsp;&nbsp;&nbsp;
                            </span>
                            <Link
                              style={{ textDecoration: 'none' }}
                              onClick={handleClose}
                              to={`/collections/${activityCollection.id}/activities/${actId}/view`}
                            >
                              {activitiesMap.get(actId)?.title}
                            </Link>
                            {getSummaryStatus(actId) === false && (
                              <FontAwesomeIcon className="ms-auto align-self-center" icon={faCheck} color="#eb6864" />
                            )}
                          </div>
                        ))}
                      </Accordion.Body>
                    </Accordion.Item>
                  );
                })}
              </Accordion>
            </Offcanvas.Body>
          </Offcanvas>
        </div>
        <ActivityView activity={currentActivity} />
      </div>
    </div>
  );
}
