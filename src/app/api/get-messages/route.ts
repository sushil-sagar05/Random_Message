import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";

export async function GET(request:Request){
    dbConnect()
    const session = await getServerSession(authOptions)
    const _user:User =  session?.user as User
    if(!session ||!_user){
     return Response.json(
         {
             success:false,
             message:"Not Authenticated"
         },{
             status:401
         }
     )
    }
    const userId = new mongoose.Types.ObjectId(_user._id);
const userExists = await UserModel.findById(userId).exec();
console.log("User Exists:", userExists);

    try {
      const user =  await UserModel.aggregate([
        {$match:{_id:userId}},
        {$unwind:'$messages'},
        {$sort:{'messages.createdAt':-1}},
        {$group:{_id:'$_id',messages:{$push:'$messages'}}}
        ]).exec();
        if(!user || user.length ===0){
            return Response.json(
                { message: 'User not found', success: false },
                { status: 404 }
              );
        }
       
        return Response.json(
            {
                success:true,
                messages: user[0].messages 
            },{
                status:200
            }
        )
    } catch (error) {
        console.log("An uxpected error occur :",error)
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