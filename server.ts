import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use raw JSON middleware
  app.use(express.json());

  // API Route: Parse Webex Invitation snippets
  app.post("/api/parse-webex", async (req, res) => {
    try {
      const { inviteText } = req.body;
      if (!inviteText) {
        return res.status(400).json({ error: "Missing inviteText parameter." });
      }

      // Initialize GoogleGenAI with server-side environment variables
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        console.error("No GEMINI_API_KEY or API_KEY configured on server.");
        return res.status(500).json({ error: "Gemini API key is not configured on the server." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

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

      // Use 'gemini-3.5-flash' for basic text extraction
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              startTime: { type: Type.STRING },
              link: { type: Type.STRING },
              webexId: { type: Type.STRING },
            },
            required: ["subject", "startTime", "link", "webexId"]
          }
        }
      });

      const text = response.text || "{}";
      const result = JSON.parse(text);
      res.json(result);
    } catch (error: any) {
      console.error("Error in /api/parse-webex:", error);
      res.status(500).json({ error: error?.message || "Failed to parse Webex invite" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // For Express v5, we must use app.get('*all', ...)
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
