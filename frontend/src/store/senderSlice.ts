import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface SenderState {
	content: string;
	code: string | null;
	copied: boolean;
	errorMessage: string;
	timeLeft: number | null;
	isTimerActive: boolean;
	hintHighlight: boolean;
	showNotification: boolean;
	notificationMessage: string;
	notificationType: 'error' | 'warning' | 'success' | 'guide';
	textareaHeight: number; // This can also be managed by useState for smoother UI performance and local control
	previousSessionData: { code: string; timeLeft: number } | null;
	isPayloadTooLarge: boolean;
	isRateLimited: boolean;
	rateLimitCooldown: number;
	isRateLimitNotificationActive: boolean;
}

const initialState: SenderState = {
	content: '',
	code: null,
	copied: false,
	errorMessage: '',
	timeLeft: null,
	isTimerActive: false,
	hintHighlight: false,
	showNotification: false,
	notificationMessage: '',
	notificationType: 'error',
	textareaHeight: 48,
	previousSessionData: null,
	isPayloadTooLarge: false,
	isRateLimited: false,
	rateLimitCooldown: 0,
	isRateLimitNotificationActive: false,
};

const senderSlice = createSlice({
	name: 'sender',
	initialState,
	reducers: {
		setContent(state, action: PayloadAction<string>) {
			state.content = action.payload;
		},
		setCode(state, action: PayloadAction<string | null>) {
			state.code = action.payload;
		},
		setCopied(state, action: PayloadAction<boolean>) {
			state.copied = action.payload;
		},
		setErrorMessage(state, action: PayloadAction<string>) {
			state.errorMessage = action.payload;
		},
		setTimeLeft(state, action: PayloadAction<number | null>) {
			state.timeLeft = action.payload;
		},
		setIsTimerActive(state, action: PayloadAction<boolean>) {
			state.isTimerActive = action.payload;
		},
		setHintHighlight(state, action: PayloadAction<boolean>) {
			state.hintHighlight = action.payload;
		},
		setShowNotification(state, action: PayloadAction<boolean>) {
			state.showNotification = action.payload;
		},
		setNotificationMessage(state, action: PayloadAction<string>) {
			state.notificationMessage = action.payload;
		},
		setNotificationType(state, action: PayloadAction<'error' | 'warning' | 'success' | 'guide'>) {
			state.notificationType = action.payload;
		},
		setTextareaHeight(state, action: PayloadAction<number>) {
			state.textareaHeight = action.payload;
		},
		setPreviousSessionData(state, action: PayloadAction<{ code: string; timeLeft: number } | null>) {
			state.previousSessionData = action.payload;
		},
		setIsPayloadTooLarge(state, action: PayloadAction<boolean>) {
			state.isPayloadTooLarge = action.payload;
		},
		setIsRateLimited(state, action: PayloadAction<boolean>) {
			state.isRateLimited = action.payload;
		},
		setRateLimitCooldown(state, action: PayloadAction<number>) {
			state.rateLimitCooldown = action.payload;
		},
		setIsRateLimitNotificationActive(state, action: PayloadAction<boolean>) {
			state.isRateLimitNotificationActive = action.payload;
		},
  	},
});

export const {
	setContent,
	setCode,
	setCopied,
	setErrorMessage,
	setTimeLeft,
	setIsTimerActive,
	setHintHighlight,
	setShowNotification,
	setNotificationMessage,
	setNotificationType,
	setTextareaHeight,
	setPreviousSessionData,
	setIsPayloadTooLarge,
	setIsRateLimited,
	setRateLimitCooldown,
	setIsRateLimitNotificationActive,
} = senderSlice.actions;

export default senderSlice.reducer;
