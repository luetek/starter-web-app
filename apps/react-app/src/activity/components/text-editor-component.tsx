import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useEffect, useState } from 'react';

export class TextEditorComponentProps {
  content!: string;

  onChange!: (txt: string) => void;

  onSave!: () => void;
}

export function TextEditorComponent(props: TextEditorComponentProps) {
  const { onChange, onSave, content } = props;
  const [localData, setLocalData] = useState('');
  const [saveButtonDisabled, setSaveButtonDisabled] = useState(false);

  useEffect(() => setLocalData(content), [content]);
  return (
    <div>
      <Form.Group className="mb-3 mx-3 w-50" controlId="input-form-control">
        <Form.Label>Input data</Form.Label>
        <Form.Control
          as="textarea"
          rows={5}
          value={localData}
          onChange={(e) => {
            onChange(e.target.value);
            setLocalData(e.target.value);
          }}
        />
      </Form.Group>
      <Button
        className="mx-2 my-2"
        disabled={saveButtonDisabled}
        onClick={async () => {
          setSaveButtonDisabled(true);
          await onSave();
          setSaveButtonDisabled(false);
        }}
      >
        Save
      </Button>
    </div>
  );
}
