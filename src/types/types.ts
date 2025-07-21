import { z } from "zod"

export const ContentSchema = z.object({
    content: z.string({message: "invalid input format or use only 'content' for POST request"})
});

export const OTPSchema = z.object({
    userCode: z.string({message: "invalid input format or use only 'userCode' for GET request"}).length(6, {message: "user is allowed to send only 6-digit code"}).regex(/^[A-Z0-9]+$/, {message: "you can only enter numbers along with upper-case alphabets"})

})