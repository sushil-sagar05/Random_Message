import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import bcrypt from "bcryptjs";
import { sendVerficationEmail } from "@/helpers/sendVerificationEmails";
export async function POST(request:Request){
    await dbConnect()
     try {
       const {username,email,password} =  await request.json()
       const existingUserVerifiedByUsername = await UserModel.findOne({
        username,
        isVerfied:true
       })
       if(existingUserVerifiedByUsername){
        return Response.json({
            success:false,
            message:"Username is already taken"
        },{status:400})
       }
      const existingUserByEmail = await UserModel.findOne({email})
      const verifyCode = Math.floor(100000+Math.random()*900000).toString()
      if(existingUserByEmail){
        if(existingUserByEmail.isVerfied){
            return Response.json({
                success:false,
                message:"User Already with this Email"
            },{status:400})
        }else{
            const hashedPassword = await bcrypt.hash(password,10)
            existingUserByEmail.password = hashedPassword;
            existingUserByEmail.verifyCode = verifyCode;
            existingUserByEmail.verifyCodeExpiry = new Date(Date.now()+3600000)
            await existingUserByEmail.save()
        }
      }else {
      const hashedPassword =   await bcrypt.hash(password,10)
      const expiryDate = new Date()
      expiryDate.setHours(expiryDate.getHours()+1);
     const newUser =  new UserModel({
          username,
            email,
            password:hashedPassword,
            verifyCode,
            verifyCodeExpiry:expiryDate,
            isAcceptingMessage:true,
            messages:[],
            isVerfied:false
      })
      await newUser.save()
      // send verification email
      const emailResponse = await sendVerficationEmail(
        email,
        username,
        verifyCode
      )
      if(!emailResponse.success){
        return Response.json({
            success:false,
            message:emailResponse.message
        },{status:500})
      }
      return Response.json({
        success:true,
        message:'User Registered Successfully. Please Verify your email'
    },{status:200})
      }
     } catch (error) {
        console.error('Error registering user',error)
        return Response.json({
            success:false,
            message:"Error registering user"
        },{
            status:500
        })
     }
}