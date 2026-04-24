import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { writeFileSync, readFileSync } from 'fs';
import path from 'path';
import LOGGER from '../utils/logger.js';

let gcpCredentials;

if (process.env.GCP_CREDENTIALS) {
    gcpCredentials = JSON.parse(process.env.GCP_CREDENTIALS);
    const tempPath = '/tmp/gcp-credentials.json';
    writeFileSync(tempPath, process.env.GCP_CREDENTIALS);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = tempPath;
} else {
    gcpCredentials = JSON.parse(readFileSync('./project-vertex.json', 'utf8'));
    const absolutePath = path.resolve('./project-vertex.json');
    process.env.GOOGLE_APPLICATION_CREDENTIALS = absolutePath;
}

delete process.env.GEMINI_API_KEY;
delete process.env.GOOGLE_API_KEY;

const projectId = gcpCredentials.project_id;
const location = process.env.GCP_LOCATION || 'us-central1';

if (!projectId) {
    LOGGER('error', 'O arquivo JSON não contém um project_id válido.');
}

const ai = new GoogleGenAI({
    project: projectId,
    location: location,
    vertexai: {
        project: projectId,
        location: location
    }
});

export default ai;
