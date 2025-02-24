import {z} from 'zod'
export const messageSchema = z.object({
    content:z
    .string()
    .min(10,{message:'content must be 10 character '})
    .max(300,{message:'content must not be longer than 300 character '}),
})