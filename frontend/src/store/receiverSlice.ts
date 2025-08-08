import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface ReceiverState {
	otp: string;
	receivedContent: string | null;
	copied: boolean;
	placeholder: string;
	animationState: 'expanding' | 'expanded' | 'complete';
	notification: {isVisible: boolean; message: string; type: 'error' | 'warning' | 'success' | 'guide';};
	isRateLimited: boolean;
	rateLimitCooldown: number;
}

const initialState: ReceiverState = {
	otp: '',
	receivedContent: null,
	copied: false,
	placeholder: '',
	animationState: 'expanding',
	notification: {isVisible: false, message: '', type: 'error',},
	isRateLimited: false,
	rateLimitCooldown: 0,
};

const receiverSlice = createSlice({
  name: 'receiver',
  initialState,
  reducers: {
    setOtp(state, action: PayloadAction<string>) {
      state.otp = action.payload;
    },
    setReceivedContent(state, action: PayloadAction<string | null>) {
      state.receivedContent = action.payload;
    },
    setCopied(state, action: PayloadAction<boolean>) {
      state.copied = action.payload;
    },
    setPlaceholder(state, action: PayloadAction<string>) {
      state.placeholder = action.payload;
    },
    setAnimationState(state, action: PayloadAction<'expanding' | 'expanded' | 'complete'>) {
      state.animationState = action.payload;
    },
    setNotification(state, action: PayloadAction<{ isVisible: boolean; message: string; type: 'error' | 'warning' | 'success' | 'guide' }>) {
      state.notification = action.payload;
    },
    setIsRateLimited(state, action: PayloadAction<boolean>) {
      state.isRateLimited = action.payload;
    },
    setRateLimitCooldown(state, action: PayloadAction<number>) {
      state.rateLimitCooldown = action.payload;
    },
  },
});

export const {
  setOtp,
  setReceivedContent,
  setCopied,
  setPlaceholder,
  setAnimationState,
  setNotification,
  setIsRateLimited,
  setRateLimitCooldown,
} = receiverSlice.actions;

export default receiverSlice.reducer;
// Updated to trigger fresh GitHub status
