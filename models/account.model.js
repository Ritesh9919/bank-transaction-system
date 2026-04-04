import mongoose from "mongoose";


const accountSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:[true, "Account must be associate with a user"],
        index:true
    },
    status:{
        enum:{
            values:["ACTIVE", "FROZEN", "CLOSED"],
            message:"Status can be either ACTIVE, FROZEN or CLOSED"
        }
    },
    currency:{
        type:String,
        required:[true, "Currency is required for creating an account"],
        default:"INR"
    }

},{timestamps:true})

accountSchema.index({user:1, status:1})

export const Account = mongoose.model("Account", accountSchema)