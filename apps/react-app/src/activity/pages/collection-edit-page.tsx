import { Link, Outlet, useParams } from 'react-router-dom';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { TreeNode } from 'primereact/treenode';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { IconType } from 'primereact/utils';
import { faBook, faBookOpen, faPenToSquare, faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PrimeIcons } from 'primereact/api';
import { RootState, useAppDispatch } from '../../store';
import { getActivityCollectionThunk } from '../activity-collection-slice';

import './act-col.scss';
import 'primeicons/primeicons.css';

enum NodeType {
  COLLECTION = 'Collection',
  ACTIVITY = 'Activity',
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

const nameTemplate = (node: SideMenuTreeNode) => {
  let icon = faBook;
  if (node.data.type === NodeType.ACTIVITY) {
    icon = faBookOpen;
  }
  return (
    <span>
      <FontAwesomeIcon className="mx-2" icon={icon} />
      <span className="mx-2">{node.label}</span>
    </span>
  );
};

const actionTemplate = (node: SideMenuTreeNode) => {
  const { id } = node.data;
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
        <div>
          <Link to={`activities/${id}/files/markdown-create`} className="mx-2">
            <FontAwesomeIcon icon={faSquarePlus} />
          </Link>
          <Link to={`activities/${id}/edit`} className="mx-2">
            <FontAwesomeIcon icon={faPenToSquare} />
          </Link>
        </div>
      );
  }
  throw new Error('Unknown type');
};

export function ActivityCollectionEditPage() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const activityCollection = useSelector((state: RootState) => state.activityCollection.current);
  const { id } = params;
  useEffect(() => {
    if (id) dispatch(getActivityCollectionThunk(parseInt(id, 10)));
  }, [dispatch, id]);

  useEffect(() => {
    if (!activityCollection || !activityCollection.id) return;

    const root = new SideMenuTreeNode();
    root.leaf = false;
    root.label = activityCollection.readableId;

    root.id = activityCollection.id.toString();
    root.expanded = true;
    root.data = { id: activityCollection.id, type: NodeType.COLLECTION, readableId: activityCollection.readableId };
    root.children = activityCollection.activities.map((activity) => {
      const node = new SideMenuTreeNode();
      node.leaf = true;
      node.id = activity.id.toString();
      node.label = activity.readableId;
      node.icon = PrimeIcons.PENCIL;
      node.expanded = true;
      node.data = { id: activity.id, type: NodeType.ACTIVITY, readableId: activity.readableId };
      return node;
    });
    setNodes([root]);
  }, [activityCollection]);

  if (!activityCollection) return <div>Loading ...</div>;
  return (
    <div>
      <div>Activity Collection Edit Page {params.id}</div>
      <div className="activity-col-container">
        <div className="activity-col-side-tree-menu">
          <TreeTable value={nodes}>
            <Column field="readableId" header="Id" body={nameTemplate} expander />
            <Column body={actionTemplate} />
          </TreeTable>
        </div>
        <div className="activity-col-main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
