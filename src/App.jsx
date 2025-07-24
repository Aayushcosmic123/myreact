import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ImageTileEditor from './ImageTileEditor';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     
        <div>
    
          <ImageTileEditor />
        </div>
        
      
    </>
  )
}

export default App
