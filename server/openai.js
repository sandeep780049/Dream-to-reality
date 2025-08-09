import axios from "axios";

const OPENAI_KEY = process.env.OPENAI_API_KEY;

export async function generateBackgroundFromPrompt(prompt, size="1024x1024"){
  // Use OpenAI images generations endpoint (gpt-image-1)
  const url = "https://api.openai.com/v1/images/generations";
  const resp = await axios.post(url, {
    model: "gpt-image-1",
    prompt,
    size
  },{
    headers: { Authorization: `Bearer ${OPENAI_KEY}`, "Content-Type":"application/json" }
  });
  // Many providers return data[0].url or base64. Accept both.
  const d = resp.data?.data?.[0];
  if(!d) throw new Error("No image returned by OpenAI");
  // If a URL was returned:
  if(d.url) return d.url;
  if(d.b64_json) return `data:image/png;base64,${d.b64_json}`;
  // fallback
  throw new Error("Unexpected OpenAI image response");
}
