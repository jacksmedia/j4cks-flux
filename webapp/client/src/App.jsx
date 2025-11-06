// client/src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Navbar from './navbar';
import Home from './pages/home';
import About from './pages/about';
import Guides from './pages/guides';
import Patchers from './pages/patchers';


function App() {
  return(
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/patchers" element={<Patchers />} />
        <Route path="/guides" element={<Guides />} />
      </Routes>
    </>
  );
}
export default App;