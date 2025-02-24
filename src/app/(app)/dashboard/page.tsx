'use client'

import MessageCard from "@/components/MessageCard"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Message } from "@/model/User.model"
import { isAcceptingMessage } from "@/schemas/acceptSchema"
import { ApiResponse } from "@/types/ApiResponse"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, { AxiosError } from "axios"
import { Loader2, RefreshCcw } from "lucide-react"
import { User } from "next-auth"
import { useSession } from "next-auth/react"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
function page() {
  const [messages,setMessages] = useState<Message[]>([])
  const [isloading,setIsloading] = useState(false)
  const[isSwitchLoading,setIsswitchLoading]= useState(false)
  const { toast } = useToast()
  
  const handleDeleteMessage = (messageId:string)=>{
    setMessages(messages.filter((message)=>message._id.toString()!==messageId))
  }
  const { data: session,update } = useSession();

  const form = useForm({
    resolver:zodResolver(isAcceptingMessage)
  })
  const {register,watch,setValue}=form;

  const acceptMessages = watch('acceptMessages')

  const fetchAcceptMessage = useCallback(async()=>{
    setIsswitchLoading(true)
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages');
      setValue('acceptMessages',response.data.isAcceptingMessages??false);
      // console.log('acceptMessages',response.data.isAcceptingMessages??false)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title:"Error",
        description:axiosError.response?.data.message||"Failed to fetch Message",
        variant:"destructive"
      })
    } finally{
      setIsswitchLoading(false)
    }
  },[setValue])

  const fetchMessages = useCallback(async(refresh:boolean=false)=>{
setIsloading(true)
setIsswitchLoading(false)
try {
 const response= await axios.get('/api/get-messages')
//  console.log(response.data.messages )
setMessages(response.data.messages || []); 
 if(refresh){
  toast({
    title:"Refresh Messages",
    description:"Showing Latest Messages",
  })
 }
} catch (error) {
  const axiosError = error as AxiosError<ApiResponse>
  toast({
    title:"Error",
    description:axiosError.response?.data.message||"Failed to fetch Message",
    variant:"destructive"
  })
}finally{
  setIsloading(false)
  setIsswitchLoading(false)
}
  },[setIsloading,setMessages])

  useEffect(() => {
    if (!session || !session.user){
      return
    };

    fetchMessages();

    fetchAcceptMessage();
  }, [session, setValue, toast, fetchAcceptMessage, fetchMessages]);


//handle switch change
const handleSwitchChange= async()=>{
  try {
  const response =  await axios.post<ApiResponse>('api/accept-messages',{
      acceptMessages:!acceptMessages
    })
    await update()
    setValue('acceptMessages',!acceptMessages)
   
    toast({
      title:response.data.message,
      variant:"default"
    })
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>
    toast({
      title:"Error",
      description:axiosError.response?.data.message||"Failed to fetch Message",
      variant:"destructive"
    })
  }

}
if(!session ||!session.user){
  return <div>Plese Login </div>
}

const {username} = session?.user as User
const baseUrl = `${window.location.protocol}//${window.location.host}`
const profileUrl = `${baseUrl}/u/${username}`

const copyToClipboard = ()=>{
  navigator.clipboard.writeText(profileUrl)
  toast({
    title:"Url Copied",
    description:"Profile Url has been copied to clipboard"
  })
}



console.log(messages)
  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register('acceptMessages')}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? 'On' : 'Off'}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isloading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
            key={message._id.toString()}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  )
}

export default page