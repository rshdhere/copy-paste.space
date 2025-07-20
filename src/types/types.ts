import { z } from "zod"

export const ContentSchema = z.object({
    content: z.string({message: "invalid input format"})
});

export const OTPSchema = z.object({
    userCode: z.string({message: "invalid input format"}).min(6, {message: "only 6 digits are allowed"})
})