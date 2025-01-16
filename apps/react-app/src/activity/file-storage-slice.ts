/* eslint-disable max-classes-per-file */
/* eslint-disable no-param-reassign */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

export class FileData {
  data!: string;

  fileName!: string;

  lastAccessed!: number; // millis

  version!: number;
}

export class FileStorageCache {
  files!: FileData[];
}

function dateDiff(first: number, second: number) {
  return Math.round((second - first) / (1000 * 60 * 60 * 24));
}

const slice = createSlice({
  name: 'file-storage',
  initialState: { files: [] } as FileStorageCache,
  reducers: {
    cleanUpCache: (state) => {
      state = { files: [] };
      return state;
    },
    cleanUpFile: (state, fileData: PayloadAction<string>) => {
      const files = state.files.filter((f) => f.fileName !== fileData.payload);
      state = { files };
      return state;
    },
    saveFileContent: (state, fileData: PayloadAction<FileData>) => {
      const file = state.files.filter((f) => f.fileName === fileData.payload.fileName)[0];
      const files = state.files.filter(
        (f) => f.fileName !== fileData.payload.fileName && dateDiff(Date.now(), f.lastAccessed) < 5
      );
      /*
      if (
        !file ||
        file.version < fileData.payload.version ||
        (file.version === fileData.payload.version && file.lastAccessed < fileData.payload.lastAccessed)
      )
        */
      state = { files: [...files, fileData.payload] };
      return state;
    },
  },
  extraReducers(builder) {
    builder.addCase(REHYDRATE, (state, action) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { ...state, ...(action as any).payload };
    });
  },
});

export const fileStorageReducer = slice.reducer;

export const { cleanUpCache, saveFileContent, cleanUpFile } = slice.actions;
