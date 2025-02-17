'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z  from "zod"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useDebounceValue,useDebounceCallback } from 'usehooks-ts'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/schemas/signUpSchema"
import axios,{AxiosError} from 'axios'
import { ApiResponse } from "@/types/ApiResponse"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

function page() {
  const [username,setUsername] = useState('')
  const [usernameMessage,setUsernameMessage] = useState('')
  const [ischeckingUsername,setisCheckingUsername] = useState(false)
  const [isSubmitting,setisSubmitting] = useState(false)
  const debounced = useDebounceCallback(setUsername,300)
  const { toast } = useToast()
  const router = useRouter()

  //zod implementation
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver:zodResolver(signUpSchema),
    defaultValues:{
      username:'',
      email:'',
      password:''
    }
  })
  useEffect(()=>{
    const checkUniqueUsername = async ()=>{
      if(username){
        setisCheckingUsername(true)
        setUsernameMessage('')
        try {
         const response =  await axios.get(`/api/check-username-unique?username=${username}`)
         
         setUsernameMessage(response.data.message)
        } catch (error) {
          const AxiosError = error as AxiosError <ApiResponse>;
          setUsernameMessage(AxiosError.response?.data.message?? "Error checking Username")

        } finally {
          setisCheckingUsername(false)
        }
      }
    }
    checkUniqueUsername()
  },[username])
  const onSubmit = async (data:z.infer<typeof signUpSchema>)=>{
    setisSubmitting(true)
    try {
     const response =  await axios.post<ApiResponse>('/api/signup',data)
     toast({
      title:'Success',
      description:response.data.message
     })
     router.replace(`/verify/${username}`);
     setisSubmitting(false)
    } catch (error) {
      console.error("Error in signUp of User",error)
      const AxiosError = error as AxiosError <ApiResponse>;
      let errorMessage = AxiosError.response?.data.message;
      toast({
        title:"Signup Failed",
        description:errorMessage,
        variant:"destructive"
      })
      setisSubmitting(false)
    }
  }
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md ">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">Join Mystery Message</h1>
          <p className="mb-4">Sign up to start your anynomous adventure</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} 
                onChange={(e)=>{
                  field.onChange(e)
                 debounced(e.target.value)
                }}
                />
              </FormControl>
              {
                  ischeckingUsername && <Loader2 className="animate-spin"/>
                }
                <p className="{`text-sm ${usernameMessage==='Username is available' ? 'text-green-500' : 'text-red-500'}`}">
                 {usernameMessage}
                </p>
              <FormMessage />
            </FormItem>
          )}
        />
          <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>email</FormLabel>
              <FormControl>
                <Input placeholder="email" {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
          <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input 
                type="password"
                placeholder="password" {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-center items-center">
        <Button className="w-[18vw] "
        type="submit" disabled={isSubmitting}>
          {
            isSubmitting?(
              <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>Please Wait
              </>
            ):('signup')
          }
        </Button>
        </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default page