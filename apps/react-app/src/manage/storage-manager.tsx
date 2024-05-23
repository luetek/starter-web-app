/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FileDto, FolderDto, RootFolderDetailReponseDto, RootFolderDto } from '@luetek/common-models';
import { Tree, NodeRendererProps } from 'react-arborist';
import { Link, useNavigate } from 'react-router-dom';
import { RootState, useAppDispatch } from '../store';
import { getRootFolderDetails, getRootFolders, setSelectedFolder } from './storage-slice';

interface StorageNode {
  type: 'RootFolder' | 'Folder' | 'File';
  name: string;
  id: string;
  data: FolderDto | FileDto;
}
const getChildren = (rootFolderDtail: RootFolderDetailReponseDto, parentFolder: FolderDto): StorageNode[] => {
  if (!rootFolderDtail || !parentFolder) return [];
  const folderNodes = rootFolderDtail.folders
    .filter((folder) => folder.parentId === parentFolder.id)
    .map((childFolder) => {
      return {
        id: `folder-${childFolder.id}`,
        name: childFolder.name,
        data: childFolder,
        children: getChildren(rootFolderDtail, childFolder),
        type: 'Folder',
      } as StorageNode;
    });

  const fileNodes = rootFolderDtail.files
    .filter((folder) => folder.parentId === parentFolder.id)
    .map((file) => {
      return {
        id: `file-${file.id}`,
        name: file.name,
        data: file,
        type: 'File',
      } as StorageNode;
    });

  return [...folderNodes, ...fileNodes];
};

function FileNode(props: NodeRendererProps<StorageNode>) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { node } = props;

  const onCreateResourceClickHandler = async (folder: FolderDto, resource: string) => {
    dispatch(setSelectedFolder(folder));
    navigate(`${resource}/create`);
  };

  if (node.data.type === 'File')
    return (
      <Link style={{ textDecoration: 'none', marginLeft: node.level * 10 }} to={`${node.data.data.id}/edit`}>
        {node.data.name}
      </Link>
    );

  return (
    <>
      <span style={{ marginLeft: node.level * 10 }} onClick={() => node.toggle()}>
        {node.data.name}
      </span>
      <button
        type="button"
        style={{ display: 'inline' }}
        onClick={() => onCreateResourceClickHandler(node.data.data as FolderDto, 'markdown')}
      >
        New Md
      </button>
      <button
        type="button"
        style={{ display: 'inline' }}
        onClick={() => onCreateResourceClickHandler(node.data.data as FolderDto, 'activity-collection')}
      >
        New Col
      </button>
    </>
  );
}
export function StorageManagerView() {
  const dispatch = useAppDispatch();
  const [treeData, setTreeData] = useState<StorageNode[]>([]);
  const storage = useSelector((state: RootState) => state.storage);
  useEffect(() => {
    const loadData = async () => {
      const rootFolders = await dispatch(getRootFolders()).unwrap();
      rootFolders.forEach((rootFolder) => {
        dispatch(getRootFolderDetails(rootFolder.id));
      });
    };
    loadData();
  }, [dispatch]);

  // Create the tree for view
  useEffect(() => {
    const nodes = storage.rootFolders.map((rootFolder) => {
      const details = storage.folderDetails.filter((item) =>
        item.folders.some((folder) => folder.rootId === rootFolder.id)
      )[0];
      const startFolder = details ? details.folders.filter((folder) => !folder.parentId)[0] : null;
      return {
        id: `root-${rootFolder.id}`,
        name: rootFolder.name,
        type: 'RootFolder',
        data: startFolder,
        children: startFolder ? getChildren(details, startFolder) : null,
      } as StorageNode;
    });
    setTreeData(nodes);
  }, [storage]);

  return (
    <div>
      <Tree data={treeData} disableDrag disableEdit disableMultiSelection>
        {FileNode}
      </Tree>
    </div>
  );
}
