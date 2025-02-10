/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityDto,
  ActivityType,
  ProgrammingActivityDto,
  ProgrammingActivityWithStdioCheck,
  ReadingActivity,
  StoragePathDto,
} from '@luetek/common-models';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { Control, FormProvider, useForm, useFormContext } from 'react-hook-form';
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

function ProgrammingActivityEditView(props: { files: StoragePathDto[] | undefined }) {
  const { files } = props;
  const { register, watch, setValue } = useFormContext<ProgrammingActivityDto>();
  const [currentTestFile, setCurrentTestfile] = useState('');
  const descriptionFiles = files?.filter((file) => file.name.endsWith('.md')) || [];
  const sourceFiles = files?.filter((file) => file.name.endsWith('.py')) || [];
  const allTestFilesList = files?.filter((file) => file.name.endsWith('.txt')) || [];

  const testFiles = watch('activitySpec.testInputFiles') || [];
  const availableTestFilesList = allTestFilesList.filter((ff) => !testFiles.includes(ff.name));
  const removeTestFileHandler = (e: any, str: string) => {
    e.preventDefault();
    setValue(
      'activitySpec.testInputFiles',
      testFiles.filter((t) => t !== str)
    );
  };
  const addKeywordHandler = () => {
    if (currentTestFile.length > 0) {
      setValue('activitySpec.testInputFiles', [...testFiles, currentTestFile]);
    }
  };

  return (
    <div>
      <div> Programming Activity with Stdin </div>
      <div className="row">
        <Form.Group className="mb-3 col-sm" controlId="editActivity.prg-simp-description">
          <Form.Label>Description File</Form.Label>
          <Form.Select {...register('activitySpec.descriptionFile')}>
            <option value={undefined}>Select the description file</option>
            {descriptionFiles.map((ff) => (
              <option key={ff.id} value={ff.name}>
                {ff.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>
      <div className="row">
        <Form.Group className="mb-3 col-sm" controlId="editActivity.testSourceFile">
          <Form.Label>Test Source File</Form.Label>
          <Form.Select aria-label="Select activity type" {...register('activitySpec.checkerSrcMainFile')}>
            <option value={undefined}>Select the test source file</option>
            {sourceFiles.map((ff) => (
              <option key={ff.id} value={ff.name}>
                {ff.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>
      <div className="row">
        <Form.Group className="mb-3 col-sm" controlId="editActivity.inputSourceFile">
          <Form.Label>Input Source File (initial code)</Form.Label>
          <Form.Select {...register('activitySpec.inputSrcMainFile')}>
            <option value={undefined}>Select the input source file</option>
            {sourceFiles.map((ff) => (
              <option key={ff.id} value={ff.name}>
                {ff.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>
      <div className="row">
        <Form.Group className="mb-3 col-sm" controlId="editActivity.addTestFiles">
          <InputGroup className="mb-3">
            <InputGroup.Text>Add TestFiles</InputGroup.Text>
            <Form.Control
              as={Form.Select}
              value={currentTestFile}
              onChange={(e) => setCurrentTestfile(e.currentTarget.value)}
              placeholder="Add Test Files"
              aria-label="add test files"
            >
              <option value="">select a test file</option>
              {availableTestFilesList.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </Form.Control>
            <Button variant="outline-secondary" id="button-addon2" onClick={addKeywordHandler}>
              Add
            </Button>
          </InputGroup>
        </Form.Group>

        <Form.Group className="mb-3 col-sm" controlId="editActivity.keywordsList">
          <Stack direction="horizontal" gap={2}>
            {testFiles.map((testFile) => (
              <Badge key={testFile} pill bg="primary">
                {testFile} <CloseButton onClick={(e) => removeTestFileHandler(e, testFile)} />
              </Badge>
            ))}
          </Stack>
        </Form.Group>
      </div>
    </div>
  );
}

export function ActivityEditMetadataPage() {
  const { id, activityId } = useParams();
  const addKeywordInputRef = useRef<HTMLInputElement>();
  const dispatch = useAppDispatch();
  const resolver = classValidatorResolver(ActivityDto);
  const methods = useForm<ActivityDto>({
    resolver,
  });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = methods;
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
      <FormProvider {...methods}>
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
                <Form.Control
                  ref={addKeywordInputRef as any}
                  placeholder="enter keywords"
                  aria-label="enter keywords"
                />
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

          {activityType === ActivityType.PROGRAMMING_ACTIVITY_STDIO_CHECK ? (
            <ProgrammingActivityEditView files={activity?.parent.children} />
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
      </FormProvider>
    </div>
  );
}
