import OpenAI from "openai";
import { readFile } from "node:fs/promises";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const rulePrompt = await readFile(new URL("./aiRulePrompt.txt", import.meta.url), "utf-8");
const userTemplate = await readFile(new URL("./aiUserPrompt.txt", import.meta.url), "utf-8");

export const summarizeArticle = async (title, body) => {
    const userPrompt = userTemplate
        .replaceAll("{{title}}", title)
        .replaceAll("{{body}}", body);

    const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: rulePrompt },
            { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2, //요약 작업은 낮은 온도가 안정적
        max_tokens: 800,
    });

    const summarizeRes = res.choices[0].message.content;
    return JSON.parse(summarizeRes);
};