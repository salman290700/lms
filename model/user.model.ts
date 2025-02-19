import bcrypt from "bcryptjs"
import { timeStamp } from "console";
import mongoose from "mongoose";
import monggose, {Document, Model, Schema} from  "mongoose"

const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+s/;

export interface IUser extends Document{
    email: string;
    name: string;
    password: string;
    avatar:{
        public_id: string;
        url: string;
    };
    role: string;
    isVerified: boolean;
    courses: Array<{courseId:string}>;
    comparePassword: (password: string) => Promise<boolean>;
}

const userSchema: Schema<IUser> = new monggose.Schema({
    name: {
        type:String,
        required: [true, "Please enter your name"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        validate: {
            validator: function (value: string) {
                return emailRegexPattern.test(value)
            },
            message: "Please enter a valid email"
        },
        unique: true,        
    },
    password: {
        type:String,
        required: [true, "Please enter your password"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false        
    },
    avatar: {
        public_id: String,
        url: String
    },
    role: {
        type: String,
        default: "user"
    },
    isVerified: {
        type:Boolean,
        default: false
    },
    courses: [{
        courseId: String
    }],

}, {timestamps:true});

// Hash Password before saving
userSchema.pre<IUser>('save', async function(next){
    if(!this.isModified('password')){
        next()
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// compare password

userSchema.methods.comparePassword = async function(enteredPassword:string): Promise<boolean>{
    return await bcrypt.compare(enteredPassword, this.password)
};

const userModel: Model<IUser> = mongoose.model("User", userSchema);

export default userModel

