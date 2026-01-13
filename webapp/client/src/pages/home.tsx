import { useEffect, useState } from "react";

// adding image gallery for persistent thumbnails
interface SavedImage {
  id: string;
  imageData: any;
  prompt: string;
  style: string;
  timestamp: number;
}

export default function Home() {
    const [imageData, setImageData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [customPrompt, setCustomPrompt] = useState('iconic tall grey castle near the blue lake');
    const [savedImages, setSavedImages] = useState<SavedImage[]>([]); 

    // Loads from localStorage
    useEffect(() => {
      try {
        const stored = localStorage.getItem('generatedImages');
        if (stored) {
          const parsed = JSON.parse(stored);
          setSavedImages(parsed);
          console.log(`Loaded ${parsed.length} images from localStorage`);
        }
      } catch (error) {
        console.error('Could not load saved images from localStorage:', error);
        // Clears corrupt local data
        localStorage.removeItem('generatedImages');
      }
    }, []);

    // Saves to localStorage
    useEffect(() => {
      try {
        if (savedImages.length > 0) {
          localStorage.setItem('generatedImages', JSON.stringify(savedImages));
          console.log(`Saved ${savedImages.length} images to localStorage`)
        } else {
          // Fallback for empty array, zero out the key
          localStorage.removeItem('generatedImages');
        }
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }, [savedImages]);

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
          model: style.model,  // see const artStyles
          prompt: style.promptTemplate(customPrompt)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Server error: ${response.status} - ${errorData.error}`);
      }

      const data = await response.json();
      setImageData(data.imageData);

      // Save image to gallery
      const newImage: SavedImage = {
        id: Date.now().toString(),
        imageData: data.imageData,
        prompt: customPrompt,
        style: style.label,
        timestamp: Date.now()
      };
      // pushes to top of gallery stack; now useEffect for localStorage
      setSavedImages(prev => [newImage, ...prev]); 

    } catch (error) {
      console.error('Error contacting server:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Loads a gallery image back into main image display
  const handleLoadSavedImage = (saved: SavedImage) => {
    setImageData(saved.imageData);
    setCustomPrompt(saved.prompt);
  };

  // Add an option to delete one image
  const handleDeleteImage = (imageId: string) => {
    setSavedImages(prev => prev.filter(img => img.id !== imageId));
  };

  // For display of localStorage available
  const getStorageInfo = () => {
    try {
      const localStorageUsed = localStorage.getItem('generatedImages');
      if (localStorageUsed) {
        const sizeInBytes = new Blob([localStorageUsed]).size;
        const sizeInKB = (sizeInBytes / 1024).toFixed(2);
        const sizeInMB = (sizeInBytes / (1024*1024)).toFixed(2);
        return +sizeInMB > 1 ? `${sizeInMB} MB` : `${sizeInKB} KB`;
      }
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="justify-center-safe pl-13" style={{width:'90vw', textAlign:'center'}}>
      
      <div className="justify-center-safe">
      <h1 className="gradient-text py-6">Simple Text-to-Image Generator</h1>
      </div>

      {/* UX:  Custom prompt input */}
      <div style={{ marginBottom: '2rem' }}>
        <label className="pt-3" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Describe what you want to portray:
        </label>
        <input
          type="text"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="iconic tall grey castle near the blue lake"
          style={{
            width: '80%',
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
          Your prompt will be combined with some other tokens and sent to an open source Gen AI text-to-image model.<br/>
          Rate limiting is in effect to prevent abuse.
          
          Developed by <a href="https://jacks.media">Jacks.Media</a>
          
        </div>
        
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
      
       {/* Current/Main Image Display */}
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

      {/* Gallery */}
      {savedImages.length > 0 && (
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '2px solid #ddd' }}>
          <h2>Previously Generated Images ({savedImages.length})</h2>
          
          <div style={{ 
              fontSize: '0.85rem', 
              color: '#666', 
              marginBottom: '1rem' 
            }}>
              Storage used on this device: {getStorageInfo()}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            {savedImages.map((saved) => (
              <div
                key={saved.id}
                style={{
                  position: 'relative',
                  border: imageData === saved.imageData ? '3px solid #0084d1' : '2px solid #ddd',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  backgroundColor: '#f9f9f9',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteImage(saved.id);
                }}
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  backgroundColor: 'rgba(220, 53, 69, 0.9)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
                title="Delete this image"
              >
                ×
              </button>

              
              <div
                key={saved.id}
                onClick={() => handleLoadSavedImage(saved)}
                style={{
                  cursor: 'pointer',
                  border: imageData === saved.imageData ? '3px solid #0084d1' : '2px solid #ddd',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  backgroundColor: '#f9f9f9',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <img
                  src={`data:image/png;base64,${saved.imageData}`}
                  alt={`Generated: ${saved.prompt}`}
                  style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                />
                <div style={{ 
                  marginTop: '0.5rem', 
                  fontSize: '0.85rem',
                  color: '#666'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    {saved.style}
                  </div>
                  <div style={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {saved.prompt}
                  </div>
                </div>
              </div>
            </div>
            ))}
          </div>
          
          {/* Clear history button */}
          <button
            onClick={() => {
              if (confirm(`You want to delete all ${savedImages.length} images on this device?`)) {
                setSavedImages([]);
              }
            }}
            style={{
              marginTop: '1.5rem',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              backgroundColor: '#c54451ff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Delete All Images
          </button>
        </div>
      )}
    </div>
  );
}