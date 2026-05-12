import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type User = {
  id: number;
  email: string;
  phone: string;
  password: string;
  role: {
    id: number;
    role_name: string;
  };
  status: string;
  created_at: string;
  updated_at: string;
  fullName: string;
  dateOfBirth?: string;
  address?: string;
  gender?: string;
  avatarUrl?: string;
  coverPhotoUrl?: string;
};

export type AuthState = {
  user: User | null;
  accessToken: string;
};

const initialState: AuthState = {
  user: null,
  accessToken: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },

    setToken: (
      state,
      action: PayloadAction<{
        accessToken: string;
      }>,
    ) => {
      state.accessToken = action.payload.accessToken;
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = "";
    },
  },
});

export const { setUser, setToken, logout } = authSlice.actions;

export default authSlice.reducer;
