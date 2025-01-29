/* eslint-disable max-classes-per-file */
/* eslint-disable no-param-reassign */

import { StoragePathDto } from '@luetek/common-models';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import axios from 'axios';
import { type RootState } from '../store';

export class FileData {
  data!: string;

  fileId?: number;

  lastAccessed!: number; // millis

  version!: number;
}

export class FileStorageCache {
  files!: FileData[];
}

export class NewFilePersistRequest {
  folderId!: number;

  fileName!: string;
}

export class UpdateFileCacheContentRequest {
  fileId?: number;

  data!: string;
}

function dateDiff(first: number, second: number) {
  return Math.round((second - first) / (1000 * 60 * 60 * 24));
}

// Store a empty data file
// This handles string only file
export const persistNewFile = createAsyncThunk<StoragePathDto, NewFilePersistRequest, { state: RootState }>(
  'file-cache/PersistNew',
  async (fileCreateReq, thunkApi) => {
    const userAccessToken = thunkApi.getState().user;

    const formData = new FormData();
    formData.append('file', new Blob(['']), fileCreateReq.fileName);
    // TODO:: Better error handling

    const fileRes = await axios.post(`api/storage/${fileCreateReq.folderId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${userAccessToken?.token}`,
      },
    });

    if (fileRes.status !== 201) throw new Error('Unable to save new File');
    const file = fileRes.data as StoragePathDto;
    return file;
  }
);

export const deleteFile = createAsyncThunk<boolean, number, { state: RootState }>(
  'file-cache/PersistNew',
  async (fileId, thunkApi) => {
    const userAccessToken = thunkApi.getState().user;

    const fileRes = await axios.delete(`api/storage/${fileId}`, {
      headers: {
        Authorization: `Bearer ${userAccessToken?.token}`,
      },
    });

    if (fileRes.status !== 200) throw new Error('Unable to delete File');
    return true;
  }
);

export const persistExistingFile = createAsyncThunk<StoragePathDto, StoragePathDto, { state: RootState }>(
  'file-cache/PersistExisiting',
  async (fileDto, thunkApi) => {
    const userAccessToken = thunkApi.getState().user;
    const fileData = thunkApi.getState().fileCache.files.filter((f) => f.fileId === fileDto.id)[0];
    if (!fileData.data) {
      throw new Error('Code is not handling closeure properly');
    }
    const formData = new FormData();
    formData.append('file', new Blob([fileData.data]), fileDto.name);
    // TODO:: Better error handling

    const fileRes = await axios.post(`api/storage/${fileDto.id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${userAccessToken?.token}`,
      },
    });

    if (fileRes.status !== 200) throw new Error('Unable to save new File');
    return fileRes.data as StoragePathDto;
  }
);

// TODO:: Handles only text file.
export const loadFile = createAsyncThunk<FileData, StoragePathDto, { state: RootState }>(
  'file-cache/loadFile',
  async (fileReq, thunkApi) => {
    const userAccessToken = thunkApi.getState().user;

    // TODO:: Handling binary data

    const fileRes = await axios.get(`api/storage/${fileReq.parentId}/stream/${fileReq.name}`, {
      responseType: 'stream',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${userAccessToken?.token}`,
      },
    });

    let str = '';
    const chunks = fileRes.data;
    for await (const chunk of chunks) {
      str += chunk;
    }

    if (fileRes.status !== 200) throw new Error('Unable to save new File');
    const fileData = new FileData();
    fileData.fileId = fileReq.id;
    fileData.version = fileReq.version;
    fileData.lastAccessed = new Date(fileReq.updatedAt).getTime();
    fileData.data = str;
    return fileData;
  }
);

const slice = createSlice({
  name: 'file-storage',
  initialState: { files: [] } as FileStorageCache,
  reducers: {
    cleanUpCache: (state) => {
      state = { files: [] };
      return state;
    },
    cleanUpFile: (state, fileData: PayloadAction<StoragePathDto>) => {
      const files = state.files.filter((f) => f.fileId !== fileData.payload.id);
      state = { files };
      return state;
    },
    updateFileCacheContent: (state, fileData: PayloadAction<UpdateFileCacheContentRequest>) => {
      const file = state.files.filter((f) => f.fileId === fileData.payload.fileId)[0];
      console.log(file);
      const files = state.files.filter(
        (f) => f.fileId !== fileData.payload.fileId && dateDiff(Date.now(), f.lastAccessed) < 5
      );
      /*
      if (
        !file ||
        file.version < fileData.payload.version ||
        (file.version === fileData.payload.version && file.lastAccessed < fileData.payload.lastAccessed)
      )
        */
      const newFile = new FileData();
      newFile.data = fileData.payload.data;
      newFile.fileId = fileData.payload.fileId;
      newFile.lastAccessed = Date.now();
      newFile.version = file.version || 0;

      state = { files: [...files, newFile] };
      return state;
    },
  },
  extraReducers(builder) {
    builder.addCase(REHYDRATE, (state, action) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { ...state, ...(action as any).payload };
    });
    builder.addCase(persistNewFile.fulfilled, (state, action) => {
      const files = state.files.filter(
        (f) => f.fileId !== action.payload.id && dateDiff(Date.now(), f.lastAccessed) < 5
      );
      const newFileData = {} as FileData;
      newFileData.lastAccessed = Date.now();
      newFileData.version = action.payload.version;
      newFileData.fileId = action.payload.id;
      newFileData.data = '';
      state = { files: [...files, newFileData] };
      return state;
    });
    builder.addCase(persistExistingFile.fulfilled, (state, action) => {
      const file = state.files.filter((f) => f.fileId === action.payload.id)[0];
      const files = state.files.filter(
        (f) => f.fileId !== action.payload.id && dateDiff(Date.now(), f.lastAccessed) < 5
      );
      const newFileData = { ...file };
      newFileData.lastAccessed = Date.now();
      newFileData.version = action.payload.version;
      state = { files: [...files, newFileData] };
      return state;
    });
    builder.addCase(loadFile.fulfilled, (state, action) => {
      const file = state.files.filter((f) => f.fileId === action.payload.fileId)[0];
      const files = state.files.filter(
        (f) => f.fileId !== action.payload.fileId && dateDiff(Date.now(), f.lastAccessed) < 5
      );
      if (action.payload.version >= file.version && action.payload.lastAccessed > file.lastAccessed) {
        state = { files: [...files, action.payload] };
      }
      return state;
    });
  },
});

export const fileCacheReducer = slice.reducer;

export const { cleanUpCache, updateFileCacheContent: saveFileContent, cleanUpFile } = slice.actions;
