
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface WebexParsedDetails {
    subject: string;
    startTime: string; // ISO String
    link: string;
    webexId: string;
}

export const parseWebexInvite = async (inviteText: string): Promise<WebexParsedDetails | null> => {
    if (!ai) {
        console.error("Gemini API not configured for Webex parsing.");
        return null;
    }

    const prompt = `
        You are a specialized parser for Cisco Webex meeting invitations.
        Extract the following information from the text below and return it as a JSON object.
        - subject: The title or topic of the meeting.
        - startTime: The scheduled start date and time. Convert this to an ISO 8601 string. Use the current year (${new Date().getFullYear()}) if not specified.
        - link: The direct Webex join URL.
        - webexId: The meeting number or ID.

        If a field is missing, use an empty string.

        Invitation Text:
        """
        ${inviteText}
        """
    `;

    try {
        // Fix: Use 'gemini-3-pro-preview' for complex text reasoning/parsing tasks
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subject: { type: Type.STRING },
                        startTime: { type: Type.STRING },
                        link: { type: Type.STRING },
                        webexId: { type: Type.STRING },
                    },
                    required: ['subject', 'startTime', 'link', 'webexId']
                }
            }
        });

        const result = JSON.parse(response.text || '{}');
        return result as WebexParsedDetails;
    } catch (error) {
        console.error("Error parsing Webex invite:", error);
        return null;
    }
};
