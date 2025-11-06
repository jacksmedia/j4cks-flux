import { useState } from "react";

export default function Home() {
    const [imageData, setImageData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [customPrompt, setCustomPrompt] = useState('iconic tall grey castle near the blue lake');


    // Multiple HF models available
    // Prompt uses user input + various premade styling tokens
    const artStyles =[
    {
      id: 'pixel',
      label: 'Pixel Art 👾',
      model: 'black-forest-labs/FLUX.1-dev',
      promptTemplate: (userInput) => `${userInput}, (pixel art 1.4, pixelated 1.4), (masterpiece, exceptional, best aesthetic, best quality, masterpiece)`
    },
    {
      id: 'anime',
      label: 'Anime 🎨',
      model: 'Qwen/Qwen-Image',
      promptTemplate: (userInput) => `${userInput}, anime style, vibrant colors, detailed, high quality, masterpiece, exceptional, best aesthetic`
    },
    {
      id: 'realistic',
      label: 'Realistic 📷',
      model: 'stabilityai/stable-diffusion-2',
      promptTemplate: (userInput) => `${userInput}, photorealistic, 8k, detailed, professional photography`
    }
  ];

  const handleQuery = async (style) => {
    setLoading(true);
    setError(null);
    setImageData(null);

    try {
      const response = await fetch('/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: style.model,
          // see const artStyles
          prompt: style.promptTemplate(customPrompt)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Server error: ${response.status} - ${errorData.error}`);
      }

      const data = await response.json();
      setImageData(data.imageData);

    } catch (error) {
      console.error('Error contacting server:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="justify-center-safe pl-13">
      
      <div className="justify-center-safe">
      <h1>Simple Text-to-Image Generator</h1>
      </div>

      {/* UX:  Custom prompt input */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Describe what you want to portray:
        </label>
        <input
          type="text"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="iconic tall grey castle near the blue lake"
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            border: '2px solid #ddd',
            borderRadius: '8px',
            marginBottom: '0.5rem',
            boxSizing: 'border-box'
          }}
          maxLength={200}
        />
        <div className="font-medium justify-center">
          Your prompt will be combined with some other tokens and sent to an open source Gen AI text-to-image model.
          Rate limiting is in effect to prevent abuse.
          
          Developed by <a href="https://jacks.media">Jacks.Media</a>
          
        </div>
        
        {/* OPTION:  Show full prompt preview -- disabled */}
        {/* <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', color: '#007bff' }}>
            Preview full prompt
          </summary>
          <div style={{ 
            marginTop: '0.5rem',
            padding: '1rem',
            backgroundColor: '#242424ff',
            borderRadius: '4px',
            fontSize: '0.9rem',
            border: '1px solid #e9ecef'
          }}>
            {customPrompt}
          </div>
        </details> */}
      </div>

      
      {/* UX:  Render multiple buttons with premade prompt styling */}
      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', marginTop: '1rem', justifyContent: 'center' }}>
        {artStyles.map(style => (
          <button
            key={style.id}
            onClick={() => handleQuery(style)}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              backgroundColor: '#0084d1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Generate {style.label}
          </button>
        ))}
      </div>

      <h3>
        {loading ? 'Generating... Please wait...' : 'Open source image models by HuggingFace inference providers'}
      </h3>
      
      {error && (
        <div style={{
          color: 'red',
          marginTop: '1rem',
          padding: '1rem',
          border: '1px solid red',
          borderRadius: '5px',
          backgroundColor: '#ffebee'
        }}>
          Error: {error}
        </div>
      )}
      
      {imageData && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Generated Image:</h2>
          <img
            src={`data:image/png;base64,${imageData}`}
            alt="Generated pixel art"
            style={{ 
              maxWidth: '100%', 
              height: 'auto', 
              border: '2px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
          />
        </div>
      )}
    </div>
  );
}