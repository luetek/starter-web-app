/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import { useEffect, useRef, useState } from 'react';
import { ActivityDto, ActivityType, ReadingActivity, StoragePathDto } from '@luetek/common-models';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useForm } from 'react-hook-form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
import Badge from 'react-bootstrap/Badge';
import CloseButton from 'react-bootstrap/CloseButton';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../../store';
import { getActivityCollectionThunk, updateActivityThunk } from '../../activity-collection-slice';
import { FilesReorderingComponent } from '../../components/files-reordering-component';

function ReadingActivityEditView(props: {
  activitySpec: ReadingActivity;
  setActivitySpecValue: (activitySpec: ReadingActivity) => void;
  files: StoragePathDto[] | undefined;
}) {
  const { activitySpec, files, setActivitySpecValue } = props;
  const existingFilesSet = new Set(activitySpec?.files?.map((file) => file.name));
  const existingFiles = activitySpec?.files || [];
  const newFiles = files?.filter((file) => !existingFilesSet.has(file.name) && file.name.endsWith('.md')) || [];
  const filesToReOrder = [...existingFiles, ...newFiles];
  return (
    <div>
      <div> Reading Activity </div>
      <FilesReorderingComponent
        files={filesToReOrder}
        setFiles={(ffs) => {
          setActivitySpecValue({ files: ffs, type: ActivityType.READING_ACTIVITY });
        }}
      />
    </div>
  );
}

export function ActivityEditMetadataPage() {
  const { id, activityId } = useParams();
  const addKeywordInputRef = useRef<HTMLInputElement>();
  const dispatch = useAppDispatch();
  const resolver = classValidatorResolver(ActivityDto);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ActivityDto>({
    resolver,
  });
  const activityCollection = useSelector((state: RootState) => state.activityCollection.current);
  const activity = activityCollection?.activities.filter(
    (act) => act.id === (activityId ? parseInt(activityId, 10) : null)
  )[0];

  const [apiError, setApiError] = useState<string>();
  const [apiMessage, setApiMessage] = useState<string>();
  const keywords = watch('keywords') || [];
  const activityType = watch('type');
  const activitySpec = watch('activitySpec');

  useEffect(() => {
    reset(activity);
  }, [activity, reset]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitHandler = async (updateDto: ActivityDto, event: any) => {
    event.preventDefault();
    try {
      // eslint-disable-next-line no-param-reassign
      updateDto.id = parseInt(activityId as string, 10);
      setApiMessage('Updating Activty.');
      await dispatch(updateActivityThunk(updateDto)).unwrap();
      // Reload the data
      await dispatch(getActivityCollectionThunk(parseInt(id as string, 10)));
      setApiMessage('Updating Done.');
    } catch (err) {
      setApiError((err as Error).message);
    }
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
    <div className="edit-activity-page-form container">
      <div className="w-100 text-center mt-2"> Edit Activity </div>
      <Form>
        <div className="row">
          <Form.Group className="mb-3 col-sm" controlId="editActivity.title">
            <Form.Label>Title</Form.Label>
            <Form.Control type="text" placeholder="" {...register('title')} />
            {errors.title && <span>{errors.title.message}</span>}
          </Form.Group>
          <Form.Group className="mb-3 col-sm" controlId="editActivity.readableId">
            <Form.Label>Title</Form.Label>
            <Form.Control type="text" readOnly placeholder="" {...register('readableId')} />
            {errors.readableId && <span>{errors.readableId.message}</span>}
          </Form.Group>
        </div>

        <div className="row">
          <Form.Group className="mb-3 col-sm" controlId="editActivity.description">
            <Form.Label>Last Name</Form.Label>
            <Form.Control as="textarea" rows={5} {...register('description')} />
            {errors.description && <span>{errors.description.message}</span>}
          </Form.Group>
        </div>
        {/* Keywords Form Elements */}
        <div className="row">
          <Form.Group className="mb-3 col-sm" controlId="editActivity.addKeywords">
            <InputGroup className="mb-3">
              <InputGroup.Text>Add Keywords</InputGroup.Text>
              <Form.Control ref={addKeywordInputRef as any} placeholder="enter keywords" aria-label="enter keywords" />
              <Button variant="outline-secondary" id="button-addon2" onClick={addKeywordHandler}>
                Add
              </Button>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3 col-sm" controlId="editActivity.keywordsList">
            <Stack direction="horizontal" gap={2}>
              {keywords.map((keyword) => (
                <Badge key={keyword} pill bg="primary">
                  {keyword} <CloseButton onClick={(e) => removeKeywordHandler(e, keyword)} />
                </Badge>
              ))}
            </Stack>
          </Form.Group>
        </div>

        {activityType === ActivityType.READING_ACTIVITY ? (
          <ReadingActivityEditView
            activitySpec={activitySpec as ReadingActivity}
            setActivitySpecValue={(spec: ReadingActivity) => setValue('activitySpec', spec)}
            files={activity?.parent.children}
          />
        ) : null}

        {apiError ? <div>{apiError}</div> : <div>{apiMessage}</div>}
        <Button
          className="edit-activity-submit-button"
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
