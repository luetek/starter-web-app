/* eslint-disable @typescript-eslint/no-explicit-any */
import Button from 'react-bootstrap/Button';
import { StoragePathDto } from '@luetek/common-models';
import ListGroup from 'react-bootstrap/ListGroup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';

interface FilesOrderingProps {
  files: StoragePathDto[];
  setFiles: (files: StoragePathDto[]) => void;
}
/*
Lists the individual activity of a section in the order as per the array.
*/
export function FilesReorderingComponent(props: FilesOrderingProps) {
  const { files, setFiles } = props;

  const onFileUpHandler = (index: number) => {
    if (index > 0) {
      // Just move item one spot up
      const nwActies = [...files];
      [nwActies[index], nwActies[index - 1]] = [nwActies[index - 1], nwActies[index]]; // swap destructing assignment
      setFiles(nwActies);
    }
  };

  const onFileDownHandler = (index: number) => {
    if (index < files.length - 1) {
      // Just move item one spot down
      const nwActies = [...files];
      [nwActies[index + 1], nwActies[index]] = [nwActies[index], nwActies[index + 1]]; // swap destructing assignment
      setFiles(nwActies);
    }
  };

  return (
    <ListGroup>
      {files.map((file, index) => {
        return (
          <ListGroup.Item key={file.id} className="d-flex p-2">
            <div className="mr-auto p-2 flex-grow-1"> {file.name}</div>
            <Button
              className="mx-2"
              variant="outline-primary"
              onClick={(e) => {
                e.preventDefault();
                onFileUpHandler(index);
              }}
            >
              <FontAwesomeIcon icon={faArrowUp} />
            </Button>
            <Button
              className="mx-2"
              variant="outline-primary"
              onClick={(e) => {
                e.preventDefault();
                onFileDownHandler(index);
              }}
            >
              <FontAwesomeIcon icon={faArrowDown} />
            </Button>
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
}
