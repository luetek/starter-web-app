import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

export interface ConfirmationModalComponentProps {
  showConfirmationDialog: boolean;

  title: string;

  message: string;

  setShowConfirmationDialog: (flag: boolean) => void;

  confirmationHandler: () => void;
}

export function ConfirmationModalComponent(props: ConfirmationModalComponentProps) {
  const { showConfirmationDialog, setShowConfirmationDialog, confirmationHandler, title, message } = props;
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => setError(''), [showConfirmationDialog]);

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      setError('');
      await confirmationHandler();
      setShowConfirmationDialog(false);
    } catch (err: any) {
      setError(err.message || err.data.message);
    }
    setIsSubmitting(false);
  };
  console.log(error);

  return (
    <Modal show={showConfirmationDialog} onHide={() => setShowConfirmationDialog(false)} animation={false}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="position-relative mb-5">{message}</Modal.Body>
      {error && error.length > 0 ? <Alert variant="danger">{error}</Alert> : null}
      <Modal.Footer>
        <Button variant="primary" disabled={isSubmitting} onClick={onSubmit}>
          Yes
        </Button>
        <Button variant="secondary" onClick={() => setShowConfirmationDialog(false)}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
