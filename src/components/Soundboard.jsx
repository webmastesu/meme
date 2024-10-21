import React, { useState, useEffect } from 'react';
import { Search, Volume2, Loader2, Download, ArrowUp } from 'lucide-react';
import { saveAs } from 'file-saver';

const Soundboard = () => {
  const [sounds, setSounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const audioRef = React.useRef(new Audio());

  useEffect(() => {
    fetchSounds();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScroll = () => {
    // Show button when user scrolls down 200px
    setShowScrollTop(window.scrollY > 200);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const fetchSounds = async () => {
    try {
      const response = await fetch('http://192.168.1.2/api.php');
      const data = await response.json();
      setSounds(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sounds:', error);
      setLoading(false);
    }
  };

  const playSound = (url, name) => {
    if (currentlyPlaying === name) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentlyPlaying(null);
    } else {
      audioRef.current.src = url;
      audioRef.current.play();
      setCurrentlyPlaying(name);
    }
  };

  const downloadSound = async (url, name) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
  
      const blob = await response.blob();
      const extension = url.split('.').pop() || 'mp3';
      saveAs(blob, `${name}.${extension}`);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const filteredSounds = sounds.filter(sound =>
    sound.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Meme Soundboard</h1>
          <p className="text-gray-400">Click to play your favorite sounds</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search sounds..."
            className="w-full p-2 pl-10 bg-gray-800 text-white rounded-lg border border-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>

        {/* Sound Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-white" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredSounds.map((sound, index) => (
              <div
                key={index}
                className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white truncate">{sound.name}</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => playSound(sound.url, sound.name)}
                      className={`p-2 rounded-full ${currentlyPlaying === sound.name ? 'bg-blue-500' : 'bg-gray-700'} hover:bg-blue-600 transition-colors`}
                    >
                      <Volume2 size={20} className="text-white" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadSound(sound.url, sound.name);
                      }}
                      className="p-2 rounded-full bg-gray-700 hover:bg-green-600 transition-colors"
                    >
                      <Download size={20} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-300 ease-in-out animate-fade-in flex items-center justify-center"
            aria-label="Scroll to top"
          >
            <ArrowUp size={24} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Soundboard;