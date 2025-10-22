require("dotenv").config();
import {Redis} from '@upstash/redis';
import { createClient } from 'redis';


const redisClient = () => {
    
    if(process.env.REDIS_URL) {
        console.log('Redis COnnected');
        const url = `${process.env.REDIS_URL as string}`;
        const token =`${process.env.REDIS_TOKEN as string}`;
        return {url, token};
    }
    throw new Error('Redis Connection Failed');
};

const redis = new Redis(redisClient());
//     url: 'https://sincere-eagle-32852.upstash.io',
//   token: 'AYBUAAIjcDFlM2NlZjI0ZDJiYzQ0OWY1OWRhMzlmOWE2MzVmZDFlYnAxMA'}


export default redis;
