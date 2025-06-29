"use client"
import { Form, FormControl,  FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { ApiResponse } from '@/types/ApiResponse'
import { Button } from "@/components/ui/button"
import axios, { AxiosError } from 'axios'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import React, { useEffect } from 'react'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { messageSchema } from '@/schemas/messageSchema'
import { useCompletion } from '@ai-sdk/react'
import data from '@/data.json'
function messagePage() {
  const { completion, input, handleInputChange, handleSubmit } = useCompletion({
    api: '/api/suggest-messages',
  });

  // const router = useRouter()
  const params = useParams<{username:string}>()
  const {toast} = useToast()
  const form = useForm<z.infer<typeof messageSchema>>({
    resolver:zodResolver(messageSchema),
    defaultValues:{
      content:'',
      
    }
  })
 


  const onSubmit = async(data:z.infer<typeof messageSchema>)=>{
    
    try {
      const response = await axios.post<ApiResponse>('/api/send-message',{
        username:params.username,
        content:data.content
      })
      if(response.status===403){
        toast({
          title:'Success',
          description:response.data.message
        })
      }
      toast({
        title:'Success',
        description:response.data.message
      })
    } catch (error) {
      console.error("Error sending Message",error)
      const AxiosError = error as AxiosError<ApiResponse>;
      let errorMessage = AxiosError.response?.data.message;
      toast({
        title:"Message Not Sent",
        description:errorMessage,
        variant:"destructive"
      })
    }
  }
  return (
    <div className='flex justify-center items-center text-center min-h-screen bg-white m-2'>
      <div className=' text-center min-h-screen w-[65vw] bg-white'>
     <div className='text-center'>
      <h1 className='text-4xl font-bold tracking-tight lg:text-4xl mb-6'>Public Profile Link</h1>
     </div>
                <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}  className="space-y-4 
               text-left">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='font-semibold'> Send anynomous message to @{params.username}</FormLabel>
                      <FormControl>
                        <Input placeholder="enter your anynomous message here" {...field}
                        className='p-4'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                type="submit">Send it</Button>
              </form>
            </Form>
        <div className='mt-8 flex items-start'>
          <div className='text-left'>
          <Button>
      Suggest Messages
     </Button>
     <p className='text-xs sm:text-sm mt-2'>click on any message below to select it</p>
          </div>
       
        </div>
        <form 
        className='border-2 space-y-2 shadow-md rounded-lg w-full p-5'
        
        onSubmit={handleSubmit}>
          <h2 className='font-bold text-left '>Messages</h2>
      {
        data.map((data,idx)=>(
          <Input
          
          name="prompt"
          value={input}
          onChange={handleInputChange}
          id="input"
        />
        ))
      }
      <Button type="submit">Submit</Button>
      <div>{completion}</div>
    </form>
    </div>
   
    </div>
  )
}

export default messagePage