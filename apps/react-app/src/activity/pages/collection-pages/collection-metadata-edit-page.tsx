/* eslint-disable @typescript-eslint/no-explicit-any */
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { ActivityCollectionDto, ActivityDto, CollectionSection, OrderedActivity } from '@luetek/common-models';
import { useForm } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useNavigate, useParams } from 'react-router-dom';
import InputGroup from 'react-bootstrap/InputGroup';
import Badge from 'react-bootstrap/Badge';
import Stack from 'react-bootstrap/Stack';
import ListGroup from 'react-bootstrap/ListGroup';
import CloseButton from 'react-bootstrap/CloseButton';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { getActivityCollectionThunk, updateActivityCollectionThunk } from '../../activity-collection-slice';
import { RootState, useAppDispatch } from '../../../store';

interface SectionViewProps {
  onActivityUpHandler: (
    section: CollectionSection,
    sectionIndex: number,
    orderedActivity: OrderedActivity,
    index: number
  ) => void;

  onActivityDownHandler: (
    section: CollectionSection,
    sectionIndex: number,
    orderedActivity: OrderedActivity,
    index: number
  ) => void;

  section: CollectionSection;

  sectionIndex: number;

  activityMap: Map<number, ActivityDto>;
}
/*
Lists the individual activity of a section in the order as per the array.
*/
function SectionView(props: SectionViewProps) {
  const { section, sectionIndex, activityMap, onActivityUpHandler, onActivityDownHandler } = props;
  return (
    <ListGroup>
      {section.orderedActivities.map((orderedActivity, index) => {
        return (
          <ListGroup.Item key={orderedActivity.orderId} className="d-flex p-2">
            <div className="mr-auto p-2 flex-grow-1"> {activityMap.get(orderedActivity.activityId)?.title}</div>
            <Button
              className="mx-2"
              variant="outline-primary"
              onClick={() => onActivityUpHandler(section, sectionIndex, orderedActivity, index)}
            >
              <FontAwesomeIcon icon={faArrowUp} />
            </Button>
            <Button className="mx-2" variant="outline-primary">
              <FontAwesomeIcon
                icon={faArrowDown}
                onClick={() => onActivityDownHandler(section, sectionIndex, orderedActivity, index)}
              />
            </Button>
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
}

interface SectionListViewProps {
  sections: CollectionSection[];
  setSections: (sections: CollectionSection[]) => void;
  activities: ActivityDto[];
}
/*
Lists the individual activity of a section in the order as per the array.
*/
function SectionListComponent(props: SectionListViewProps) {
  const addSectionTitleInput = useRef<HTMLInputElement>();
  const { activities, sections, setSections } = props;
  const activityMap = new Map(activities.map((activity) => [activity.id, activity]));
  const activitySet = new Set(activities.map((activity) => activity.id));
  sections.forEach((section) => {
    section.orderedActivities
      .map((activityPair) => activityPair.activityId)
      .forEach((value) => activitySet.delete(value));
  });

  const activityUnused = [...activitySet];
  const existingUnused = sections.find((col) => col.default);
  let sectionAll = sections; // we dont need to make a copy here
  if (!existingUnused) {
    const unUsedSection = new CollectionSection();
    unUsedSection.title = 'Unused';
    unUsedSection.sectionId = 100;
    unUsedSection.default = true;
    unUsedSection.orderedActivities = [
      ...activityUnused.map((activityId, index) => {
        const ordAct = new OrderedActivity();
        ordAct.orderId = index + 100; // Just some numbers which does not clash UUID will be fine too.
        ordAct.activityId = activityId;
        return ordAct;
      }),
    ];
    sectionAll = [...sections, unUsedSection];
  } else {
    existingUnused.orderedActivities = [
      ...existingUnused.orderedActivities,
      ...activityUnused.map((activityId, index) => {
        const ordAct = new OrderedActivity();
        ordAct.orderId = index + 100; // Just some numbers which does not clash UUID will be fine too.
        ordAct.activityId = activityId;
        return ordAct;
      }),
    ];
  }

  const addSectionHandler = (e: any) => {
    e.preventDefault();
    const title = addSectionTitleInput.current?.value;

    if (title && title.length > 8) {
      const newSection = new CollectionSection();
      newSection.title = title;
      newSection.sectionId = sectionAll.length + 1;
      newSection.orderedActivities = [];
      setSections([newSection, ...sectionAll]);
    }
  };

  const onSectionUpHandler = (sectionIndex: number) => {
    if (sectionIndex > 0) {
      const newSections = [...sectionAll];
      [newSections[sectionIndex - 1], newSections[sectionIndex]] = [
        newSections[sectionIndex],
        newSections[sectionIndex - 1],
      ];
      setSections(newSections);
    }
  };

  const onSectionDownHandler = (sectionIndex: number) => {
    if (sectionIndex < sectionAll.length - 1) {
      const newSections = [...sectionAll];
      [newSections[sectionIndex + 1], newSections[sectionIndex]] = [
        newSections[sectionIndex],
        newSections[sectionIndex + 1],
      ];
      setSections(newSections);
    }
  };

  const activityUpHandler = (
    collectionSection: CollectionSection,
    sectionIndex: number,
    orderedActivity: OrderedActivity,
    activityIndex: number
  ) => {
    // Need to move to previous section.
    if (activityIndex === 0 && sectionIndex > 0) {
      const movedFromSectionActivities = collectionSection.orderedActivities.filter((act) => act !== orderedActivity);
      const addToSection = sectionAll[sectionIndex - 1];
      const movedToSectionActivities = [...addToSection.orderedActivities, orderedActivity];
      const newMovedFromSection = { ...collectionSection, orderedActivities: movedFromSectionActivities };
      const newMovedToSection = { ...addToSection, orderedActivities: movedToSectionActivities };
      const newSections = [...sectionAll];
      sectionAll[sectionIndex - 1] = newMovedToSection;
      sectionAll[sectionIndex] = newMovedFromSection;
      setSections(newSections);
    } else if (activityIndex > 0) {
      // Just move item one spot up
      const nwActies = [...collectionSection.orderedActivities];
      [nwActies[activityIndex], nwActies[activityIndex - 1]] = [nwActies[activityIndex - 1], nwActies[activityIndex]]; // swap destructing assignment
      const newSection = { ...collectionSection, orderedActivities: nwActies };
      sectionAll[sectionIndex] = newSection;
      const newSections = [...sectionAll];
      setSections(newSections);
    }
  };

  const activityDownHandler = (
    collectionSection: CollectionSection,
    sectionIndex: number,
    orderedActivity: OrderedActivity,
    activityIndex: number
  ) => {
    // Need to move to next section.
    if (activityIndex === collectionSection.orderedActivities.length - 1 && sectionIndex < sectionAll.length - 1) {
      const movedFromSectionActivities = collectionSection.orderedActivities.filter((act) => act !== orderedActivity);
      const addToSection = sectionAll[sectionIndex + 1];
      const movedToSectionActivities = [...addToSection.orderedActivities, orderedActivity];
      const newMovedFromSection = { ...collectionSection, orderedActivities: movedFromSectionActivities };
      const newMovedToSection = { ...addToSection, orderedActivities: movedToSectionActivities };
      const newSections = [...sectionAll];
      sectionAll[sectionIndex + 1] = newMovedToSection;
      sectionAll[sectionIndex] = newMovedFromSection;
      setSections(newSections);
    } else if (activityIndex < collectionSection.orderedActivities.length - 1) {
      // Just move item one spot down
      const nwActies = [...collectionSection.orderedActivities];
      [nwActies[activityIndex + 1], nwActies[activityIndex]] = [nwActies[activityIndex], nwActies[activityIndex + 1]]; // swap destructing assignment
      const newSection = { ...collectionSection, orderedActivities: nwActies };
      sections[sectionIndex] = newSection;
      const newSections = [...sections];
      setSections(newSections);
    }
  };

  return (
    <div>
      <InputGroup className="mb-2">
        <InputGroup.Text>Create a Section</InputGroup.Text>
        <Form.Control ref={addSectionTitleInput as any} placeholder="Enter the title for the section." />
        <Button onClick={(e) => addSectionHandler(e)}> Save </Button>
      </InputGroup>
      <ListGroup>
        {sectionAll.map((section, sectionIndex) => {
          return (
            <ListGroup.Item key={section.sectionId} variant="primary">
              <div className="d-flex p-2">
                <div className="mr-auto p-2 flex-grow-1"> {section.title}</div>
                <Button className="mx-2" variant="outline-primary" onClick={() => onSectionUpHandler(sectionIndex)}>
                  <FontAwesomeIcon icon={faArrowUp} />
                </Button>
                <Button className="mx-2" variant="outline-primary">
                  <FontAwesomeIcon icon={faArrowDown} onClick={() => onSectionDownHandler(sectionIndex)} />
                </Button>
              </div>
              <div>
                <SectionView
                  sectionIndex={sectionIndex}
                  section={section}
                  onActivityUpHandler={activityUpHandler}
                  onActivityDownHandler={activityDownHandler}
                  activityMap={activityMap}
                />
              </div>
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    </div>
  );
}

export function ActivityCollectionMetadataEditPage() {
  const { id } = useParams();
  const resolver = classValidatorResolver(ActivityCollectionDto);
  const addAuthorInputRef = useRef<HTMLInputElement>();
  const addKeywordInputRef = useRef<HTMLInputElement>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string>();
  const [apiMessage, setApiMessage] = useState<string>();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ActivityCollectionDto>({
    resolver,
  });
  const activityCollection = useSelector((state: RootState) => state.activityCollection.current);

  const title = watch('title') || '';
  const authors = watch('authors') || [];
  const keywords = watch('keywords') || [];
  const sections = watch('sections') || [];
  const activities = watch('activities') || [];

  useEffect(() => {
    reset(activityCollection);
  }, [activityCollection, reset]);

  useEffect(() => {
    setValue('readableId', title.toLowerCase().replace(/(\s)+/g, '-'));
  }, [title, setValue]);

  useEffect(() => {
    if (id) dispatch(getActivityCollectionThunk(parseInt(id, 10)));
  }, [dispatch, id]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitHandler = async (updateDto: ActivityCollectionDto, event: any) => {
    event.preventDefault();
    try {
      setApiMessage('Updating ActivityCollection.');
      await dispatch(updateActivityCollectionThunk(updateDto)).unwrap();
      navigate(0); // Refresh
    } catch (err) {
      setApiError((err as Error).message);
    }
  };

  const addAuthorHandler = async (event: any) => {
    event.preventDefault();
    if (
      !addAuthorInputRef ||
      !addAuthorInputRef.current ||
      !addAuthorInputRef.current.value ||
      addAuthorInputRef.current?.value.length <= 4
    )
      return;
    const newAuthor = addAuthorInputRef.current?.value as string;
    const authorsRec = authors || [];
    setValue('authors', [newAuthor, ...authorsRec]);
    addAuthorInputRef.current.value = '';
  };

  const removeAuthorHandler = async (event: any, authorToBeRemoved: string) => {
    event.preventDefault();
    const authorsRec = authors || [];
    setValue(
      'authors',
      authorsRec.filter((author) => author !== authorToBeRemoved)
    );
  };

  const addKeywordHandler = async (event: any) => {
    event.preventDefault();
    if (
      !addKeywordInputRef ||
      !addKeywordInputRef.current ||
      !addKeywordInputRef.current.value ||
      addKeywordInputRef.current?.value.length <= 4
    )
      return;
    const newKeyword = addKeywordInputRef.current?.value as string;
    const keywordsRec = keywords || [];
    setValue('keywords', [newKeyword, ...keywordsRec]);
    addKeywordInputRef.current.value = '';
  };

  const removeKeywordHandler = async (event: any, keywordToBeRemoved: string) => {
    event.preventDefault();
    const keywordsRec = keywords || [];
    setValue(
      'keywords',
      keywordsRec.filter((keyword) => keyword !== keywordToBeRemoved)
    );
  };

  return (
    <div className="create-activity-collection-page-form container">
      <div className="w-100 text-center mt-2"> Create Activity Collection </div>
      <Form>
        <div className="row">
          <Form.Group className="mb-3 col-sm" controlId="createActivityCollection.title">
            <Form.Label>Title</Form.Label>
            <Form.Control type="text" placeholder="" {...register('title')} />
            {errors.title && <span>{errors.title.message}</span>}
          </Form.Group>
          <Form.Group className="mb-3 col-sm" controlId="createActivityCollection.readableId">
            <Form.Label>Title</Form.Label>
            <Form.Control type="text" placeholder="" {...register('readableId')} />
            {errors.readableId && <span>{errors.readableId.message}</span>}
          </Form.Group>
        </div>

        <div className="row">
          <Form.Group className="mb-3 col-sm" controlId="createActivityCollection.description">
            <Form.Label>Last Name</Form.Label>
            <Form.Control as="textarea" rows={5} {...register('description')} />
            {errors.description && <span>{errors.description.message}</span>}
          </Form.Group>
        </div>
        {/* Authors Form Elements */}
        <div className="row">
          <Form.Group className="mb-3 col-sm" controlId="createActivityCollection.addAuthors">
            <InputGroup className="mb-3">
              <InputGroup.Text>Add Authors</InputGroup.Text>
              <Form.Control ref={addAuthorInputRef as any} placeholder="enter username" aria-label="enter username" />
              <Button variant="outline-secondary" id="button-addon2" onClick={addAuthorHandler}>
                Add
              </Button>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3 col-sm" controlId="createActivityCollection.authorsList">
            <Stack direction="horizontal" gap={2}>
              {authors.map((author) => (
                <Badge key={author} pill bg="primary">
                  {author} <CloseButton onClick={(e) => removeAuthorHandler(e, author)} />
                </Badge>
              ))}
            </Stack>
          </Form.Group>
        </div>

        {/* Keywords Form Elements */}
        <div className="row">
          <Form.Group className="mb-3 col-sm" controlId="createActivityCollection.addKeywords">
            <InputGroup className="mb-3">
              <InputGroup.Text>Add Keywords</InputGroup.Text>
              <Form.Control ref={addKeywordInputRef as any} placeholder="enter keywords" aria-label="enter keywords" />
              <Button variant="outline-secondary" id="button-addon2" onClick={addKeywordHandler}>
                Add
              </Button>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3 col-sm" controlId="createActivityCollection.keywordsList">
            <Stack direction="horizontal" gap={2}>
              {keywords.map((keyword) => (
                <Badge key={keyword} pill bg="primary">
                  {keyword} <CloseButton onClick={(e) => removeKeywordHandler(e, keyword)} />
                </Badge>
              ))}
            </Stack>
          </Form.Group>
        </div>

        {/* Sections Management Form Components */}
        <SectionListComponent
          activities={activities}
          sections={sections}
          setSections={(sectns) => setValue('sections', sectns)}
        />
        {apiError ? <div>{apiError}</div> : <div>{apiMessage}</div>}
        <Button
          className="create-activity-collection-submit-button"
          disabled={isSubmitting}
          type="submit"
          onClick={handleSubmit(submitHandler)}
        >
          Save
        </Button>
      </Form>
    </div>
  );
}
