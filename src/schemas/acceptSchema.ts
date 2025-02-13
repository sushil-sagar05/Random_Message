import {z} from 'zod'
export const isAcceptingMessage = z.object({
    acceptMessages:z.boolean()
})