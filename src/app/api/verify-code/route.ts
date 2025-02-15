import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { use } from "react";


export async function POST(request:Request){
    await dbConnect()
        try {
            const {username,code} = await request.json()
           const decodedUsername=  decodeURIComponent(username)
          const user= await UserModel.findOne({username:decodedUsername})
          if(!user){
            return Response.json(
                {
                    success:false,
                    message:"User Not Found"
                },{
                    status:400
                }
            )
          }
          const isCodeValid = user.verifyCode===code
          const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()
          if(isCodeValid &&isCodeNotExpired){
            user.isVerfied=true;
            await user.save()
            return Response.json(
                {
                    success:true,
                    message:"Account Verified Successfully"
                },{
                    status:200
                }
            )
          } else if(!isCodeNotExpired){
            return Response.json(
                {
                    success:false,
                    message:"Verification Code has expired ,please signup to get a new code"
                },{
                    status:500
                }
            )
          }else {
            return Response.json(
                {
                    success:false,
                    message:"Code is incorrect"
                },{
                    status:500
                }
            )
          }
        } catch (error) {
            console.log("Error verifying user",error)
            return Response.json(
                {
                    success:false,
                    message:"Error verifying user"
                },{
                    status:500
                }
            )
        }
    
}