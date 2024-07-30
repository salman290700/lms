import {app} from "./app"
import connDB from "./utils/db";
import { redis } from "./utils/redis";

require('dotenv').config()
// Create server 

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
    connDB();
})

