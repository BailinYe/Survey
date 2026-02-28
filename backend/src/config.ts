import dotenv from "dotenv";

dotenv.config();

export const configuration = {
    server: {
        port: parseInt(process.env.PORT || '3000', 10),
    },
    env: process.env.NODE_ENV || 'development',
};
