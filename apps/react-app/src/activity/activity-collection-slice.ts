/* eslint-disable no-param-reassign */
import {
  ActivityCollectionDto,
  ActivityDto,
  CreateActivityCollectionRequestDto,
  CreateActivityRequestDto,
} from '@luetek/common-models';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import axios from 'axios';
import { type RootState } from '../store';

export const getActivityCollectionThunk = createAsyncThunk<ActivityCollectionDto, number, { state: RootState }>(
  'activity-collection/findOne',
  async (id: number) => {
    const collectionRes = await axios.get(`/api/activity-collections/${id}`);
    const collection = collectionRes.data as ActivityCollectionDto;
    if (!collectionRes || collectionRes.status !== 200) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      throw new Error((collectionRes as any)?.response?.data?.message || 'Unavailable to fetch data');
    }

    return collection;
  }
);

export const createActivityCollectionThunk = createAsyncThunk<
  ActivityCollectionDto,
  CreateActivityCollectionRequestDto,
  { state: RootState }
>('activity-collection/create', async (createRequestDto: CreateActivityCollectionRequestDto, thunkApi) => {
  const userAccessToken = thunkApi.getState().user;
  const res = await axios.post('/api/activity-collections', createRequestDto, {
    headers: { Authorization: `Bearer ${userAccessToken?.token}` },
  });

  if (!res || res.status !== 201) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throw new Error((res as any)?.response?.data?.message || 'Unable to save data');
  }

  return res.data as ActivityCollectionDto;
});

export const createActivityThunk = createAsyncThunk<ActivityDto, CreateActivityRequestDto, { state: RootState }>(
  'activity-collection/create',
  async (createRequestDto: CreateActivityRequestDto, thunkApi) => {
    const userAccessToken = thunkApi.getState().user;
    const res = await axios.post(
      `/api/activity-collections/${createRequestDto.collectionId}/activities`,
      createRequestDto,
      {
        headers: { Authorization: `Bearer ${userAccessToken?.token}` },
      }
    );

    if (!res || res.status !== 201) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      throw new Error((res as any)?.response?.data?.message || 'Unable to save data');
    }

    return res.data as ActivityDto;
  }
);

export const updateActivityCollectionThunk = createAsyncThunk<
  ActivityCollectionDto,
  ActivityCollectionDto,
  { state: RootState }
>('activity-collection/update', async (updateRequestDto: ActivityCollectionDto, thunkApi) => {
  const userAccessToken = thunkApi.getState().user;
  const res = await axios.put('/api/activity-collections', updateRequestDto, {
    headers: { Authorization: `Bearer ${userAccessToken?.token}` },
  });

  if (!res || res.status !== 200) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throw new Error((res as any)?.response?.data?.message || 'Unable to save data');
  }

  return res.data as ActivityCollectionDto;
});

export class ActivityCollectionState {
  current?: ActivityCollectionDto;
}

const slice = createSlice({
  name: 'activityCollection',
  initialState: {} as ActivityCollectionState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(getActivityCollectionThunk.fulfilled, (state, action) => {
      state.current = action.payload;
      return state;
    });

    builder.addCase(createActivityCollectionThunk.fulfilled, (state, action) => {
      state.current = action.payload;
      return state;
    });

    builder.addCase(updateActivityCollectionThunk.fulfilled, (state, action) => {
      state.current = action.payload;
      return state;
    });

    builder.addCase(REHYDRATE, (state, action) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { ...state, ...(action as any).payload };
    });
  },
});

export const activityCollectionReducer = slice.reducer;
