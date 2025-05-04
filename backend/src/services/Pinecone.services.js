import { Pinecone } from '@pinecone-database/pinecone';
import fs from 'fs/promises';
import { ApiError } from '../utils/apiError.js';
import { pineconeConfig } from '../config/pinecone.config.js';


const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

class PineconeService {
    constructor() {
        this.index = null;
    }

    async initialize() {
        if (!this.index) {
            this.index = pc.index(pineconeConfig.indexName);
        }
        return this;
    }

    async upsertEmbeddings() {
        try {
            // Read the embedded tests
            const rawData = await fs.readFile('./embeddings/embedded_tests.json', 'utf8');
            const embeddedTests = JSON.parse(rawData);

            // Prepare vectors for Pinecone
            const vectors = embeddedTests.map(test => ({
                id: test.id,
                values: test.embedding,
                metadata: {
                    name: test.name,
                    description: test.description,
                    testType: test.testType,
                    duration: test.duration,
                    url: test.url,
                    remoteTesting: test.remoteTesting,
                    adaptiveIRT: test.adaptiveIRT
                }
            }));

            // Upsert in batches of 100
            const batchSize = 100;
            for (let i = 0; i < vectors.length; i += batchSize) {
                const batch = vectors.slice(i, i + batchSize);
                await this.index.upsert(batch);
            }

            return {
                success: true,
                count: vectors.length
            };

        } catch (error) {
            throw new ApiError(500, "Error upserting vectors to Pinecone: " + error.message);
        }
    }

    async searchSimilarTests(queryEmbedding, topK = 5) {
        try {
            const queryResponse = await this.index.query({
                vector: queryEmbedding,
                topK,
                includeMetadata: true
            });

            return queryResponse.matches.map(match => ({
                score: match.score,
                ...match.metadata
            }));

        } catch (error) {
            throw new ApiError(500, "Error searching vectors in Pinecone: " + error.message);
        }
    }
}

const pineconeService = new PineconeService();
export default pineconeService;