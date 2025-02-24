import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { isAcceptingMessage } from "@/schemas/acceptSchema";

export async function POST(request:Request){
    await dbConnect()
    const session = await getServerSession(authOptions)
   const user =  session?.user
//    console.log(user)
   if(!session ||!session.user){
    return Response.json(
        {
            success:false,
            message:"Not Authenticated"
        },{
            status:401
        }
    )
   }
   const userId = user?._id;
   const {acceptMessages } = await request.json()
   try {
   const updatedUser =  await UserModel.findByIdAndUpdate(userId,{isAcceptingMessages:acceptMessages},{
        new:true
    })
    if(!updatedUser){
        return Response.json(
            {
                success:false,
                message:"failed to update user status to accept messages"
            },{
                status:401
            }
        )
    }
     else {
        return Response.json(
            {
                success:true,
                message:"Message acceptance status updated successfully",
                updatedUser
            },{
                status:200
            }
        )
     }
   } catch (error) {
    console.log("Failed to update user status to accept messages");
    return Response.json(
        {
            success:false,
            message:"Not Authenticated"
        },{
            status:401
        }
    )
   }

}
export async function GET(request:Request) {
    await dbConnect()
    const session = await getServerSession(authOptions)
   const user =  session?.user
   if(!session ||!session.user){
    return Response.json(
        {
            success:false,
            message:"Not Authenticated"
        },{
            status:401
        }
    )
   }
   const userId = user?._id; 
 try {
     const foundUser =  await UserModel.findById(userId)
     if(!foundUser){
       return Response.json(
           {
               success:false,
               message:"User Not Found"
           },{
               status:404
           }
       )
     }
     return Response.json(
       {
           success:true,
          isAcceptingMessages:foundUser.isAcceptingMessages??false       },{
           status:200
       }
   )
 } catch (error) {
    console.log("Error in getting message status");
    return Response.json(
        {
            success:false,
            message:"Not Authenticated"
        },{
            status:500
        }
    )
 }
}