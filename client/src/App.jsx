import React, { useState } from "react";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [userImage, setUserImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!prompt) return alert("Please enter your dream prompt!");

    setLoading(true);

    const formData = new FormData();
    formData.append("prompt", prompt);
    if (userImage) formData.append("userImage", userImage);

    try {
      const res = await fetch("http://localhost:4000/generate", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setResultImage(data.image);
      }
    } catch (e) {
      alert("Server error, try again later.");
    }

    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h1>Dream to Reality</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          rows={4}
          placeholder="Type your dream or imagination..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setUserImage(e.target.files[0])}
        />
        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Image"}
        </button>
      </form>
      <br />
      {resultImage && (
        <img
          src={resultImage}
          alt="Generated Dream"
          style={{ width: "100%", borderRadius: 10 }}
        />
      )}
    </div>
  );
}
