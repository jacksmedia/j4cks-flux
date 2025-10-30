// client/src/App.jsx
import { useState } from 'react';

const App = () => {
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('a shattered cyberpunk city');


  // Multiple HF models available
  // Prompt uses user input + various premade styling tokens
  const artStyles =[
    {
      id: 'pixel',
      label: 'Pixel Art',
      model: 'black-forest-labs/FLUX.1-dev',
      promptTemplate: (userInput) => `${userInput}, (pixel art, pixelated 1.4), (masterpiece, exceptional, best aesthetic, best quality, masterpiece, extremely detailed 1.2)`
    },
    {
      id: 'anime',
      label: 'Anime',
      model: 'Qwen/Qwen-Image',
      promptTemplate: (userInput) => `${userInput}, anime style, vibrant colors, detailed, high quality`
    },
    {
      id: 'realistic',
      label: 'Realistic',
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
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>HuggingFace Text-to-Image Generator</h1>
      
      {/* UX:  Custom prompt input */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Describe what you want to create:
        </label>
        <input
          type="text"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="a shattered cyberpunk city"
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
        <small style={{ color: '#666', fontSize: '0.9rem' }}>
          Your prompt will be combined with some other tokens and sent to an open source Gen AI text-to-image model
        </small>
        
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
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
        {artStyles.map(style => (
          <button
            key={style.id}
            onClick={() => handleQuery(style)}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              backgroundColor: '#007bff',
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
        {loading ? 'Generating Pixel Art...' : 'Generate Pixel Art'}
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
};

export default App;