// src/store/store.ts

import { configureStore } from '@reduxjs/toolkit';
import senderReducer from './senderSlice';
import receiverReducer from './receiverSlice';


export const store = configureStore({
    reducer: {
        sender: senderReducer,
        receiver: receiverReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
// Updated to trigger GitHub status
