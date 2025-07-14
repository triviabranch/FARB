import { useState, useRef } from 'react';
import ColorThief from 'colorthief';
import { HexColorPicker } from 'react-colorful';

export default function Home() {
  const [dominantColor, setDominantColor] = useState(null);
  const [category, setCategory] = useState('shoes');
  const [gender, setGender] = useState('women');
  const [type, setType] = useState('heels');
  const imgRef = useRef();

  const extractColor = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const colorThief = new ColorThief();
        const [r, g, b] = colorThief.getColor(img);
        setDominantColor({ r, g, b });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Send data to backend (Step 2)
    const response = await fetch('/api/search', {
      method: 'POST',
      body: JSON.stringify({ dominantColor, category, gender, type }),
    });
    const results = await response.json();
    console.log(results); // Will show affiliate links (Step 3)
  };

  return (
    <div>
      <h1>Find Matching Accessories</h1>
      <form onSubmit={handleSubmit}>
        {/* Image Upload */}
        <input type="file" accept="image/*" onChange={extractColor} ref={imgRef} />
        
        {/* Color Display */}
        {dominantColor && (
          <div>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              backgroundColor: `rgb(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b})` 
            }} />
            <HexColorPicker color={`#${((1 << 24) | (dominantColor.r << 16) | (dominantColor.g << 8) | dominantColor.b).toString(16).slice(1)}`} />
          </div>
        )}

        {/* Category Filters */}
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="shoes">Shoes</option>
          <option value="bag">Bag</option>
          <option value="belt">Belt</option>
        </select>

        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="men">Men</option>
          <option value="women">Women</option>
        </select>

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="heels">Heels</option>
          <option value="sneakers">Sneakers</option>
          <option value="loafers">Loafers</option>
        </select>

        <button type="submit">Search</button>
      </form>
    </div>
  );
}
