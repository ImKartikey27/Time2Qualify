import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();

export const pineconeConfig = {
    apiKey: process.env.PINECONE_API_KEY,
    indexName: process.env.PINECONE_INDEX_NAME
};

export const pc = new Pinecone({
    apiKey: pineconeConfig.apiKey,
});