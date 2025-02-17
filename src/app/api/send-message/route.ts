import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { Message } from "@/model/User.model";


export async function POST(request:Request) {
    await dbConnect()
    const {username,content} = await request.json()
    try {
       const user = await UserModel.findOne({username})
       if(!user){
        return Response.json(
            {
                success:false,
                message:"User Not Found"
            },{
                status:404
            }
        )
       }
       // is user accepting the messages
       if(!user.isAcceptingMessage){
        return Response.json(
            {
                success:false,
                message:"User is not accepting messages"
            },{
                status:403
            }
        )
       }
       const newMessage = {content,createdAt:new Date()}
       user.messages.push(newMessage as Message)
       await user.save()
       return Response.json(
        {
            success:true,
            message:"Message sent successfully"
        },{
            status:201
        }
    )
    } catch (error) {
        console.log("Error adding messages:",error)
        return Response.json(
            {
                success:false,
                message:"Internal server Error"
            },{
                status:500
            }
        )
    }
}