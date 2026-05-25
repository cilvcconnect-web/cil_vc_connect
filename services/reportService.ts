
import { GoogleGenAI } from "@google/genai";
import { VC, User } from '../types';

// The API key MUST be obtained exclusively from the environment variable `process.env.API_KEY`.
// This variable is assumed to be pre-configured and accessible.
const apiKey = process.env.API_KEY;

// Initialize AI client only if API key is available to prevent app crash on load.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

if (!ai) {
    console.error("API_KEY environment variable not set. AI report generation will be disabled.");
}

export const generateVCReport = async (vcs: VC[], users: User[]): Promise<string> => {
    if (!ai) {
        return "AI report generation is disabled because the API key is not configured.";
    }

    const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown';

    const prompt = `
        Generate a concise summary report based on the following VC (Video Conference) data.
        The data is provided in JSON format.
        Analyze the data and provide insights on VC statuses (Scheduled, Completed, In Progress, Cancelled),
        and any other notable patterns. Do not just list the meetings. Provide a high-level summary.
        
        VC Data:
        ${JSON.stringify(vcs.map(vc => ({
            subject: vc.subject,
            status: vc.status,
            manager: getUserName(vc.managerId),
            conductor: getUserName(vc.conductorId),
            startTime: vc.startTime,
            remarks: vc.remarks,
        })), null, 2)}
    `;

    try {
        // Fix: Use 'gemini-3-flash-preview' for basic text tasks like summarization
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating report from Gemini API:", error);
        return "Failed to generate report due to an API error.";
    }
};
