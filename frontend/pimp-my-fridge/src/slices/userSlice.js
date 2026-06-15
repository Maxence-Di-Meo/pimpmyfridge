import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
	name: "User",
	initialState: {
		user: {},
		location: null,
	},
	reducers: {
		update_user: (state, action) => {
			state.user = action.payload.user;
		},
		update_user_location: (state, action) => {
			state.location = action.payload;
		},
	},
});

export const { update_user, update_user_location } = userSlice.actions;

export default userSlice.reducer;
