import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FileDto, FolderDto, RootFolderDetailReponseDto, RootFolderDto } from '@luetek/common-models';
import { Tree } from 'react-arborist';
import { RootState, useAppDispatch } from '../store';
import { getRootFolderDetails, getRootFolders } from './storage-slice';

interface StorageNode {
  type: 'RootFolder' | 'Folder' | 'File';
  name: string;
  id: string;
  data: RootFolderDto | FolderDto | FileDto;
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
        data: rootFolder,
        children: startFolder ? getChildren(details, startFolder) : null,
      } as StorageNode;
    });
    setTreeData(nodes);
  }, [storage]);

  return (
    <div>
      <Tree data={treeData} />
    </div>
  );
}
