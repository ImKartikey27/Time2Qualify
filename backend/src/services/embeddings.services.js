import { HfInference } from '@huggingface/inference';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;
const hf = new HfInference(HF_TOKEN);

async function createEmbeddings() {
    try {
        // Read the SHL tests
        const rawData = await fs.readFile('./embeddings/SHL_tests.json', 'utf8');
        const tests = JSON.parse(rawData);

        // Create embeddings for each test
        const embeddedTests = await Promise.all(tests.map(async (test) => {
            const textToEmbed = `${test.name} ${test.description} Test type: ${test.testType} Duration: ${test.duration}`;
            
            const embedding = await hf.featureExtraction({
                model: 'sentence-transformers/all-MiniLM-L6-v2',
                inputs: textToEmbed,
            });

            return {
                ...test,
                embedding
            };
        }));

        // Save the embedded tests
        await fs.writeFile(
            './embeddings/embedded_tests.json',
            JSON.stringify(embeddedTests, null, 2)
        );

        console.log(`Created embeddings for ${tests.length} tests`);

    } catch (error) {
        console.error('Error creating embeddings:', error);
    }
}

createEmbeddings();