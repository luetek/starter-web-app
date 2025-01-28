import { Link, Outlet, useParams } from 'react-router-dom';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { TreeNode } from 'primereact/treenode';
import { useSelector } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';
import { IconType } from 'primereact/utils';
import { faBook, faBookOpen, faFile, faPenToSquare, faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Dropdown from 'react-bootstrap/Dropdown';
import { RootState, useAppDispatch } from '../../store';
import { getActivityCollectionThunk } from '../activity-collection-slice';

import './act-col.scss';
import 'primeicons/primeicons.css';
import { FileNameModalComponent } from '../components/file-name-modal-component';
import { persistNewFile } from '../file-storage-slice';

enum NodeType {
  COLLECTION = 'Collection',
  ACTIVITY = 'Activity',
  FILE = 'FILE',
}

export class SideMenuTreeNode implements TreeNode {
  /**
   * Unique identifier of the element.
   */
  id?: string | undefined;

  /**
   * Unique key of the node.
   */
  key?: string | number | undefined;

  /**
   * Label of the node.
   */
  label?: string | undefined;

  /**
   * Data represented by the node.
   */
  data?: any | undefined;

  /**
   * Icon of the node to display next to content.
   */
  icon?: IconType<TreeNode> | undefined;

  /**
   * Used to get the child elements of the component.
   * @readonly
   */
  children?: TreeNode[] | undefined;

  /**
   * Inline style of the node.
   */
  style?: React.CSSProperties | undefined;

  /**
   * Style class of the node.
   */
  className?: string | undefined;

  leaf?: boolean | undefined;

  /**
   * Visibility of node.
   */
  expanded?: boolean | undefined;
}

// Display each type in the side menu
const nameTemplate = (node: SideMenuTreeNode) => {
  let icon = faBook;
  if (node.data.type === NodeType.ACTIVITY) {
    icon = faBookOpen;
  }
  if (node.data.type === NodeType.FILE) {
    icon = faFile;
  }
  return (
    <span>
      <FontAwesomeIcon className="mx-2" icon={icon} />
      <span className="mx-2">{node.label}</span>
    </span>
  );
};
// Create action menu for each type.
const createActionTemplate = (handler: (activityId: number, fileExt: string) => void) => {
  const actionTemplate = (node: SideMenuTreeNode) => {
    const { id, parentActivityId } = node.data;
    switch (node.data.type) {
      case NodeType.COLLECTION:
        return (
          <div>
            <Link to="activities/create" className="mx-2">
              <FontAwesomeIcon icon={faSquarePlus} />
            </Link>
            <Link to="" className="mx-2">
              <FontAwesomeIcon icon={faPenToSquare} />
            </Link>
          </div>
        );
      case NodeType.ACTIVITY:
        return (
          <div className="d-flex">
            <Dropdown className="dropdown-admin-side-menu">
              <Dropdown.Toggle variant="danger" className="dropdown-admin-side-menu-button">
                <FontAwesomeIcon icon={faSquarePlus} />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item className="mx-2" onClick={() => handler(id, 'md')}>
                  Markdown
                </Dropdown.Item>
                <Dropdown.Item className="mx-2" onClick={() => handler(id, 'py')}>
                  Python
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Link to={`activities/${id}/edit`} className="mx-2">
              <FontAwesomeIcon icon={faPenToSquare} />
            </Link>
          </div>
        );
      case NodeType.FILE:
        return (
          <div>
            <Link to={`activities/${parentActivityId}/files/${id}/edit`} className="mx-2">
              <FontAwesomeIcon icon={faPenToSquare} />
            </Link>
          </div>
        );
    }
    throw new Error('Unknown type');
  };
  return actionTemplate;
};

export function ActivityCollectionEditPage() {
  const { id, activityId, fileId } = useParams();
  const dispatch = useAppDispatch();
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  // For passing arround arguments from handlers.
  const [activityIdForAction, setActivityIdForAction] = useState<number>();
  const [fileExtension, setFileExtension] = useState('');
  const [showfileNameDialog, setShowfileNameDialog] = useState(false);
  const activityCollection = useSelector((state: RootState) => state.activityCollection.current);
  const activitySelected = useMemo(
    () => activityCollection?.activities.filter((act) => act.id === (activityId ? parseInt(activityId, 10) : 0))[0],
    [activityId, activityCollection]
  );

  const createFileSaveSubmitHandler = async (fileName: string) => {
    if (!activityCollection || !activityIdForAction) return;
    const activitySelectedForAction = activityCollection.activities.filter((act) => act.id === activityIdForAction)[0];
    await dispatch(persistNewFile({ folderId: activitySelectedForAction.parent.id, fileName })).unwrap();
    // TODO:: We can do this efficiently
    await dispatch(getActivityCollectionThunk(activityCollection.id));
    // TODO:: Redirect to fileEdit Page
  };

  const actionTemplate = useMemo(() => {
    const createFileHandler = async (actId: number, fileExt: string) => {
      setShowfileNameDialog(true);
      setFileExtension(fileExt);
      setActivityIdForAction(actId);
    };
    return createActionTemplate(createFileHandler);
  }, [setShowfileNameDialog, setFileExtension]);

  const fileSelected = useMemo(
    () => activitySelected?.parent?.children?.filter((file) => file.id === (fileId ? parseInt(fileId, 10) : 0))[0],
    [fileId, activitySelected]
  );

  useEffect(() => {
    if (id) dispatch(getActivityCollectionThunk(parseInt(id, 10)));
  }, [dispatch, id]);

  useEffect(() => {
    if (!activityCollection || !activityCollection.id) return;

    const root = new SideMenuTreeNode();
    root.leaf = false;
    root.label = activityCollection.readableId;
    root.id = activityCollection.id.toString();
    root.key = root.id;
    root.expanded = true;
    root.data = { id: activityCollection.id, type: NodeType.COLLECTION, readableId: activityCollection.readableId };
    root.children = activityCollection.activities.map((activity) => {
      const node = new SideMenuTreeNode();
      node.leaf = false;
      node.id = `${activityCollection.id.toString()}-${activity.id.toString()}`;
      node.key = node.id;
      node.label = activity.readableId;
      node.expanded = activitySelected?.id === activity.id;
      node.data = { id: activity.id, type: NodeType.ACTIVITY, readableId: activity.readableId };
      node.children = activity.parent?.children
        ?.map((file) => {
          const fileNode = new SideMenuTreeNode();
          fileNode.leaf = true;
          fileNode.id = `${activityCollection.id.toString()}-${activity.id.toString()}-${file.id.toString()}`;
          fileNode.key = fileNode.id;
          fileNode.label = file.name;
          fileNode.expanded = fileSelected?.id === file.id;
          fileNode.data = { id: file.id, type: NodeType.FILE, readableId: file.name, parentActivityId: activity.id };
          return fileNode;
        })
        .filter((nn) => nn.label !== 'activity.json'); // Filter out activity.json as we will not edit it from UI
      return node;
    });
    setNodes([root]);
  }, [activityCollection, activitySelected, fileSelected]);

  if (!activityCollection) return <div>Loading ...</div>;
  return (
    <div>
      <div>Activity Collection Edit Page {activityCollection.title}</div>
      <div className="activity-col-container">
        <div className="activity-col-side-tree-menu">
          <TreeTable value={nodes}>
            <Column field="readableId" header="Id" body={nameTemplate} expander />
            <Column body={actionTemplate} />
          </TreeTable>
        </div>
        <FileNameModalComponent
          showfileNameDialog={showfileNameDialog}
          setShowfileNameDialog={setShowfileNameDialog}
          fileExtension={fileExtension}
          submitHandler={createFileSaveSubmitHandler}
        />
        <div className="activity-col-main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
