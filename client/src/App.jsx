import React, { useState } from "react";
import axios from "axios";

export default function App(){
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [resultUrl, setResultUrl] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e){
    e && e.preventDefault();
    if(!prompt.trim() || !file) return alert("Provide prompt and a photo.");
    setStatus("uploading");
    setError(null);
    const fd = new FormData();
    fd.append("photo", file);
    fd.append("prompt", prompt);
    try{
      const res = await axios.post("/api/compose", fd, { headers: { "Content-Type": "multipart/form-data" }, responseType: "json" });
      setResultUrl(res.data.imageUrl);
      setStatus("done");
    }catch(err){
      setError(err?.response?.data?.error || err.message);
      setStatus("error");
    }
  }

  return (
    <div className="container">
      <h1>Dream → Reality</h1>
      <p>Type a prompt and upload a photo. We'll place you into the scene.</p>

      <form onSubmit={handleSubmit}>
        <div style={{marginBottom:10}}>
          <textarea rows={3} placeholder='e.g. "Riding a dragon over Paris at sunset, cinematic"' value={prompt} onChange={e=>setPrompt(e.target.value)} />
        </div>

        <div style={{display:"flex", gap:10, alignItems:"center"}}>
          <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} />
          <button type="submit">Generate</button>
        </div>
      </form>

      <div style={{marginTop:14}}>
        <div>Status: {status}</div>
        {error && <div style={{color:"red"}}>Error: {error}</div>}
        <div className="preview">
          {resultUrl && <>
            <div>
              <img src={resultUrl} alt="result" />
              <div style={{marginTop:8}}>
                <a href={resultUrl} download="dream.png"><button>Download</button></a>
              </div>
            </div>
          </>}
        </div>
      </div>
    </div>
  );
}
