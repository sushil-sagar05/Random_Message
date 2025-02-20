import mongoose,{Schema,Document} from "mongoose";

export interface Message extends Document{
    _id:mongoose.Types.ObjectId
    content:string;
    createdAt:Date;
}

const MessageSchema:Schema<Message> = new mongoose.Schema({
    content:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        required:true,
        default:Date.now
    }
})
export interface User extends Document{
    username:string;
    email:string;
    password:string;
    verifyCode:string;
    verifyCodeExpiry:Date;
    isAcceptingMessages:boolean;
    messages:Message[];
    isVerfied:boolean
}
const UserSchema:Schema<User>=new mongoose.Schema({
    username:{
        type:String,
        required:[true,"Username is required"],
        trim:true,
        unique:true,
    },
    email:{
        type:String,
        required:[true,"email is required"],
        unique:true,
        // match:[/.+/@.+\..+/,'please use a valid email address']
    },
    password:{
        type:String,
        required:[true,"Password is required"],
    },
    verifyCode:{
        type:String,
        required:[true,"VerifyCode is required"],
    },
    verifyCodeExpiry:{
        type:Date,
        required:[true,"verifyCode is required"],
    },
    isVerfied:{
        type:Boolean,
        default:false
    },
    isAcceptingMessages:{
        type:Boolean,
        default:true,
    },
    messages:[MessageSchema]
})
const UserModel = (mongoose.models.User as mongoose.Model<User>) ||(mongoose.model<User>("User",UserSchema))
export default UserModel;
