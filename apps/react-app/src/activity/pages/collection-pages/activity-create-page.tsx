/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import {
  ActivitySpecMetadata,
  ActivityType,
  CreateActivityRequestDto,
  ProgrammingActivityWithStdioCheck,
  ReadingActivity,
} from '@luetek/common-models';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useForm } from 'react-hook-form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
import Badge from 'react-bootstrap/Badge';
import CloseButton from 'react-bootstrap/CloseButton';
import { useAppDispatch } from '../../../store';
import { createActivityThunk } from '../../activity-collection-slice';

function activitySpecBuilder(activityType: ActivityType): ActivitySpecMetadata {
  switch (activityType) {
    case ActivityType.PROGRAMMING_ACTIVITY_STDIO_CHECK:
      return new ProgrammingActivityWithStdioCheck();
    case ActivityType.READING_ACTIVITY:
      return new ReadingActivity();
  }
  throw new Error('Unknown type');
}

export function ActivityCreatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addKeywordInputRef = useRef<HTMLInputElement>();
  const dispatch = useAppDispatch();
  const resolver = classValidatorResolver(CreateActivityRequestDto);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateActivityRequestDto>({
    defaultValues: new CreateActivityRequestDto(),
    resolver,
  });
  console.log(id);
  const [apiError, setApiError] = useState<string>();
  const [apiMessage, setApiMessage] = useState<string>();
  const title = watch('title') || '';
  const keywords = watch('keywords') || [];

  useEffect(() => {
    setValue('readableId', title.toLowerCase().replace(/(\s)+/g, '-'));
  }, [title, setValue]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitHandler = async (createDto: CreateActivityRequestDto, event: any) => {
    event.preventDefault();
    try {
      // eslint-disable-next-line no-param-reassign
      createDto.collectionId = parseInt(id as string, 10);
      setApiMessage('Creating Activty.');
      console.log('Creating Activity');
      const res = await dispatch(createActivityThunk(createDto)).unwrap();
      navigate(`/activity-collections/${res.collectionId}/edit`);
      console.log('Done');
    } catch (err) {
      setApiError((err as Error).message);
    }
  };

  const onActivityChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    const currentValue = e.target.value;
    setValue('type', currentValue as ActivityType);
    setValue('activitySpec', activitySpecBuilder(currentValue as ActivityType));
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
    <div className="create-activity-page-form container">
      <div className="w-100 text-center mt-2"> Create Activity </div>
      <Form>
        <div className="row">
          <Form.Group className="mb-3 col-sm" controlId="createActivity.title">
            <Form.Label>Title</Form.Label>
            <Form.Control type="text" placeholder="" {...register('title')} />
            {errors.title && <span>{errors.title.message}</span>}
          </Form.Group>
          <Form.Group className="mb-3 col-sm" controlId="createActivity.readableId">
            <Form.Label>Title</Form.Label>
            <Form.Control type="text" placeholder="" {...register('readableId')} />
            {errors.readableId && <span>{errors.readableId.message}</span>}
          </Form.Group>
        </div>

        <div className="row">
          <Form.Group className="mb-3 col-sm" controlId="createActivity.description">
            <Form.Label>Last Name</Form.Label>
            <Form.Control as="textarea" rows={5} {...register('description')} />
            {errors.description && <span>{errors.description.message}</span>}
          </Form.Group>
        </div>
        {/* Keywords Form Elements */}
        <div className="row">
          <Form.Group className="mb-3 col-sm" controlId="createActivity.addKeywords">
            <InputGroup className="mb-3">
              <InputGroup.Text>Add Keywords</InputGroup.Text>
              <Form.Control ref={addKeywordInputRef as any} placeholder="enter keywords" aria-label="enter keywords" />
              <Button variant="outline-secondary" id="button-addon2" onClick={addKeywordHandler}>
                Add
              </Button>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3 col-sm" controlId="createActivity.keywordsList">
            <Stack direction="horizontal" gap={2}>
              {keywords.map((keyword) => (
                <Badge key={keyword} pill bg="primary">
                  {keyword} <CloseButton onClick={(e) => removeKeywordHandler(e, keyword)} />
                </Badge>
              ))}
            </Stack>
          </Form.Group>
        </div>

        <div>
          <Form.Group className="mb-3 col-sm" controlId="createActivity.activityType">
            <Form.Select aria-label="Select activity type" onChange={onActivityChangeHandler}>
              <option>Select the activity type</option>
              <option value={ActivityType.PROGRAMMING_ACTIVITY_STDIO_CHECK}>Programming Activity With Main</option>
              <option value={ActivityType.READING_ACTIVITY}>Reading Activity</option>
            </Form.Select>
          </Form.Group>
        </div>

        {apiError ? <div>{apiError}</div> : <div>{apiMessage}</div>}
        <Button
          className="create-activity-submit-button"
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
