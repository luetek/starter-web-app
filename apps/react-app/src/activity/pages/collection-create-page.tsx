/* eslint-disable @typescript-eslint/no-explicit-any */
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { CreateActivityCollectionRequestDto } from '@luetek/common-models';
import { useForm } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useNavigate } from 'react-router-dom';
import InputGroup from 'react-bootstrap/esm/InputGroup';
import Badge from 'react-bootstrap/Badge';
import Stack from 'react-bootstrap/Stack';
import CloseButton from 'react-bootstrap/CloseButton';
import { createActivityCollectionThunk } from '../activity-collection-slice';
import { useAppDispatch } from '../../store';

export function ActivityCollectionCreatePage() {
  const resolver = classValidatorResolver(CreateActivityCollectionRequestDto);
  const addAuthorInputRef = useRef<HTMLInputElement>();
  const addKeywordInputRef = useRef<HTMLInputElement>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateActivityCollectionRequestDto>({
    defaultValues: new CreateActivityCollectionRequestDto(),
    resolver,
  });
  const [apiError, setApiError] = useState<string>();
  const [apiMessage, setApiMessage] = useState<string>();
  const title = watch('title') || '';
  const authors = watch('authors') || [];
  const keywords = watch('keywords') || [];

  useEffect(() => {
    setValue('readableId', title.toLowerCase().replace(/(\s)+/g, '-'));
  }, [title, setValue]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitHandler = async (createDto: CreateActivityCollectionRequestDto, event: any) => {
    event.preventDefault();
    try {
      setApiMessage('Creating ActivtyCollection.');
      const res = await dispatch(createActivityCollectionThunk(createDto)).unwrap();
      navigate(`/activity-collections/${res.id}/view`);
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
