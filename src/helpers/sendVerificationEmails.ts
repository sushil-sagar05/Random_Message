import { resend } from "@/lib/resend";

import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";
export async function sendVerficationEmail(
    email:string,
    username:string,
    verifyCode:string
):Promise<ApiResponse>{
    try {
       await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Random Message | Verification code',
            react:VerificationEmail({username,otp:verifyCode})
          });
        return {success:true,message:'verfication email sent successfully'}
    } catch (emailError) {
        console.log("Error sending verification email",emailError)
        return {success:false,message:'failed to send verfication email'}
    }
}