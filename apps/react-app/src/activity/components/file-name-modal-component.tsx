import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { Length, Matches } from 'class-validator';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import { useForm } from 'react-hook-form';

export interface FileNameModalComponentProps {
  showfileNameDialog: boolean;

  fileExtension: string; // 'md', 'ts', 'js', 'py'

  setShowfileNameDialog: (flag: boolean) => void;

  submitHandler: (fileName: string) => void;
}

class FileNameData {
  @Length(5, 10)
  @Matches(/^[a-zA-Z0-9_-]*$/, { message: 'filename can contain alphanumeric, hyphen and underscore characters only' })
  fileName!: string;
}

export function FileNameModalComponent(props: FileNameModalComponentProps) {
  const { showfileNameDialog, setShowfileNameDialog, fileExtension, submitHandler } = props;
  const resolver = classValidatorResolver(FileNameData);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FileNameData>({ resolver });

  const onSubmit = async (data: FileNameData) => {
    try {
      setError('');
      await submitHandler(`${data.fileName}.${fileExtension}`);
      setShowfileNameDialog(false);
    } catch (err: any) {
      setError(err.message || err.data.message);
    }
  };
  console.log(errors);

  return (
    <Modal show={showfileNameDialog} onHide={() => setShowfileNameDialog(false)} animation={false}>
      <Modal.Header closeButton>
        <Modal.Title>Enter the file name</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && error.length > 0 ? <Alert variant="danger">{error}</Alert> : null}
        <InputGroup className="mb-3">
          <InputGroup.Text>file Name</InputGroup.Text>
          <Form.Control aria-label="filename without the extension" {...register('fileName')} />
          <InputGroup.Text>.{fileExtension}</InputGroup.Text>
          <Form.Control.Feedback type={isValid ? 'valid' : 'invalid'}>
            {errors.fileName?.message || 'Looks good'}
          </Form.Control.Feedback>
        </InputGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowfileNameDialog(false)}>
          Close
        </Button>
        <Button variant="primary" disabled={isSubmitting} onClick={handleSubmit(onSubmit)}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
