/* eslint-disable no-param-reassign */
import { PasswordAuthRequestDto, UpdateUserRequestDto, UserAccessToken, UserDto } from '@luetek/common-models';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import axios from 'axios';
import { type RootState } from '../store';

export const loginThunk = createAsyncThunk('users/login', async (passwordDto: PasswordAuthRequestDto) => {
  const tokenRes = await axios.post('/api/auth/login', passwordDto);
  const token = tokenRes.data as UserAccessToken;
  if (!token || tokenRes.status !== 201) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throw new Error((tokenRes as any)?.response?.data?.message || 'Authentication Error');
  }

  return token;
});

export const logoutThunk = createAsyncThunk<unknown, void, { state: RootState }>(
  'users/logout',
  async (_, thunkApi) => {
    const userAccessToken = thunkApi.getState().user;
    await axios.delete(`/api/auth/user-access-tokens/${userAccessToken?.id}`, {
      headers: { Authorization: `Bearer ${userAccessToken?.token}` },
    });
  }
);

export const getMe = createAsyncThunk<UserDto, void, { state: RootState }>('users/me', async (_, thunkApi) => {
  const userAccessToken = thunkApi.getState().user;
  const res = await axios.get(`/api/users/${userAccessToken?.user?.id}`, {
    headers: { Authorization: `Bearer ${userAccessToken?.token}` },
  });

  return res.data as UserDto;
});

export const updateMe = createAsyncThunk<UserDto, UpdateUserRequestDto, { state: RootState }>(
  'users/update',
  async (updateUserDto, thunkApi) => {
    const userAccessToken = thunkApi.getState().user;
    const res = await axios.put(`/api/users/${userAccessToken.user?.id}`, updateUserDto, {
      headers: { Authorization: `Bearer ${userAccessToken?.token}` },
    });

    if (res.status !== 200) throw new Error('Unable to save data');
    return res.data as UserDto;
  }
);

const slice = createSlice({
  name: 'test',
  initialState: {} as UserAccessToken,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(loginThunk.fulfilled, (state, action) => {
      Object.assign(state, action.payload);
      return state;
    });
    builder.addCase(logoutThunk.fulfilled, (state, action) => {
      state = {};
      return state;
    });

    builder.addCase(getMe.fulfilled, (state, action) => {
      state.user = action.payload;
      return state;
    });

    builder.addCase(updateMe.fulfilled, (state, action) => {
      state.user = action.payload;
      return state;
    });

    builder.addCase(REHYDRATE, (state, action) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { ...state, ...(action as any).payload };
    });
  },
});

export const userReducer = slice.reducer;
