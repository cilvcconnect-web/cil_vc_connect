
export interface WebexParsedDetails {
    subject: string;
    startTime: string; // ISO String
    link: string;
    webexId: string;
}

export const parseWebexInvite = async (inviteText: string): Promise<WebexParsedDetails | null> => {
    try {
        const response = await fetch("/api/parse-webex", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ inviteText }),
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || `HTTP error ${response.status}`);
        }

        const result = await response.json();
        return result as WebexParsedDetails;
    } catch (error) {
        console.error("Error parsing Webex invite via server API:", error);
        return null;
    }
};

