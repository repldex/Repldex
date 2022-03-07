// we just go to the .env file and convert it into a JSON array for easy access
import dotenv from 'dotenv'
dotenv.config()

let config: JSON;
config = JSON.parse(JSON.stringify(process.env));

export default config;