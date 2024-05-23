/* eslint-disable no-param-reassign */
import { Folder, FolderDto, RootFolderDetailReponseDto, RootFolderDto } from '@luetek/common-models';
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { type RootState } from '../store';

export const getRootFolders = createAsyncThunk<RootFolderDto[], void, { state: RootState }>(
  'storage/findAll',
  async (_unused, thunkApi) => {
    // const userAccessToken = thunkApi.getState().user;
    const res = await axios.get('/api/folders', {
      //  headers: { Authorization: `Bearer ${userAccessToken?.token}` },
    });

    if (res.status !== 200) throw new Error('Unable to load root folders');
    return res.data as RootFolderDto[];
  }
);

export const getRootFolderDetails = createAsyncThunk<RootFolderDetailReponseDto, number, { state: RootState }>(
  'storage/findOne',
  async (id, _thunkApi) => {
    // const userAccessToken = thunkApi.getState().user;
    const res = await axios.get(`/api/folders/${id}`, {
      //  headers: { Authorization: `Bearer ${userAccessToken?.token}` },
    });

    if (res.status !== 200) throw new Error('Unable to load root folders');
    return res.data as RootFolderDetailReponseDto;
  }
);

export class StorageState {
  rootFolders!: RootFolderDto[];

  folderDetails!: RootFolderDetailReponseDto[];

  selectedFolder!: FolderDto | null;
}

const slice = createSlice({
  name: 'storage',
  initialState: { rootFolders: [], folderDetails: [], selectedFolder: null } as StorageState,
  reducers: {
    setSelectedFolder: (state, payload: PayloadAction<FolderDto>) => {
      state.selectedFolder = payload.payload;
      return state;
    },
  },
  extraReducers(builder) {
    builder.addCase(getRootFolders.fulfilled, (state, action) => {
      state.rootFolders = action.payload;
      return state;
    });
    builder.addCase(getRootFolderDetails.fulfilled, (state, action) => {
      // TODO:: not the best way to do tihs
      state.folderDetails.push(action.payload);
      return state;
    });
  },
});

export const storageReducer = slice.reducer;
export const { setSelectedFolder } = slice.actions;
