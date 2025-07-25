import { z } from "zod"

export const ContentSchema = z.object({
    content: z.string({message: "invalid input format or use only 'content' for POST request"})
    // .regex(/^[a-zA-Z0-9\s\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF.,!?;:()\-_'"\/@#$%&*+=\[\]{}|\\~`\n\r\t\u2000-\u206F\u2E00-\u2E7F\u3000-\u303F\uFE10-\uFE1F\uFE30-\uFE4F]{1,10000}$/, {message: "user can send only code-text-languages etc, vulnarabilities like SQL-Injections must fail"})
    
    // need to fix this area
});

export const OTPSchema = z.object({
    userCode: z.string({message: "invalid input format or use only 'userCode' for GET request"}).length(6, {message: "user is allowed to send only 6-digit code"}).regex(/^[A-Z0-9]+$/, {message: "user can only enter numbers along with upper-case alphabets"})

})