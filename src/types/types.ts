import { z } from "zod"

export const ContentSchema = z.object({
    content: z.string({message: "invalid input format or use only 'content' for POST request"}).regex(/^[A-Z0-9]+$/, {message: "user can only send numbers and alphabets"})
});

export const OTPSchema = z.object({
    userCode: z.string({message: "invalid input format or use only 'userCode' for GET request"}).length(6, {message: "user is allowed to send only 6-digit code"}).regex(/^[A-Z0-9]+$/, {message: "user can only enter numbers along with upper-case alphabets"})

})