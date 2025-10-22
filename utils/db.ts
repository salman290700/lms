import mongoose from 'mongoose'
require('dotenv').config()

const dburl:string = process.env.DB_URL || '';

const connDB = async() => {
    try{
        await mongoose.connect(dburl).then((data: any) => {            
            console.log(`Database connected with port ${process.env.PORT}`)
        });
        
        
    }catch(e: any) {
        console.log(e.message);
        setTimeout(connDB, 5000);
    }
}

export default connDB;