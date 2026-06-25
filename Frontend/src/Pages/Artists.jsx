import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TargetLines = ({ active }) => (
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
    <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: active ? '100%' : 0, opacity: active ? 1 : 0 }} style={{ position: 'absolute', top: '50%', left: 0, height: '1.5px', backgroundColor: '#DC143C', boxShadow: '0 0 8px #DC143C' }} />
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: active ? '100%' : 0, opacity: active ? 1 : 0 }} style={{ position: 'absolute', left: '50%', top: 0, width: '1.5px', backgroundColor: '#DC143C', boxShadow: '0 0 8px #DC143C' }} />
    <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: active ? 1 : 0, opacity: active ? 1 : 0 }} style={{ position: 'absolute', top: '50%', left: '50%', width: '60px', height: '60px', border: '1.5px solid #DC143C', borderRadius: '50%', transform: 'translate(-50%, -50%)', marginLeft: '-30px', marginTop: '-30px' }} />
  </div>
);

// --- THE MANIFESTO MODAL ---
const CollabModal = ({ artist, inventory, onClose }) => {
  // DYNAMIC FILTERING: Find all products matching this exact creator
  const artistCollabs = inventory.filter(
    item => item.creator && item.creator.toLowerCase() === artist.name.toLowerCase()
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', backdropFilter: 'blur(10px)' }}
    >
      <div style={{ width: '100%', maxWidth: '900px', backgroundColor: '#050505', border: '1px solid #333', position: 'relative', overflowY: 'auto', maxHeight: '90vh' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '40px', borderTop: '4px solid #DC143C', borderLeft: '4px solid #DC143C' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '40px', height: '40px', borderBottom: '4px solid #DC143C', borderRight: '4px solid #DC143C' }} />

        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', color: '#fff', backgroundColor: 'transparent', border: '1px solid #333', padding: '10px 15px', fontFamily: 'monospace', fontSize: '10px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Terminate View X
        </button>

        <div style={{ padding: '60px 40px' }}>
          <h1 style={{ color: '#fff', fontSize: '48px', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 40px 0', lineHeight: 1, letterSpacing: '-1px' }}>
            Forged by the <br/><span style={{ color: '#DC143C' }}>God of Hands.</span>
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
            <div style={{ borderLeft: '2px solid #333', paddingLeft: '20px' }}>
              <p style={{ color: '#DC143C', fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px', fontWeight: 'bold' }}>01 // The Art of the Hand</p>
              <p style={{ color: '#ccc', fontSize: '16px', lineHeight: 1.6, margin: 0, maxWidth: '600px' }}>
                This is the absolute discipline of creation. Flesh commands the machine. Thread bends to intent. 
                It is not built. It is summoned. Each asset is a limited-edition vessel of intent, engineered for the shadows and stripped of compromise. Function dictates form. 
              </p>
            </div>

            <div style={{ borderLeft: '2px solid #333', paddingLeft: '20px' }}>
              <p style={{ color: '#DC143C', fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px', fontWeight: 'bold' }}>02 // Technical Brief</p>
              
              <div style={{ border: '1px solid #222', backgroundColor: '#000' }}>
                {artistCollabs.length > 0 ? (
                  artistCollabs.map((collab, idx) => (
                    <div key={idx} style={{ display: 'flex', borderBottom: idx !== artistCollabs.length - 1 ? '1px solid #222' : 'none' }}>
                      <div style={{ width: '120px', padding: '15px', borderRight: '1px solid #222', color: '#666', fontFamily: 'monospace', fontSize: '10px', display: 'flex', alignItems: 'center' }}>SGN-{collab.id}</div>
                      <div style={{ flex: 1, padding: '15px', color: '#fff', fontWeight: 'bold', textTransform: 'uppercase' }}>{collab.name}</div>
                      <div style={{ flex: 1, padding: '15px', color: '#aaa', fontSize: '12px', textTransform: 'uppercase', display: 'flex', alignItems: 'center' }}>{collab.material}</div>
                      <div style={{ padding: '15px', color: '#DC143C', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>{collab.price}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '20px', color: '#666', fontFamily: 'monospace', fontSize: '10px', textTransform: 'uppercase' }}>NO ASSETS DETECTED FOR THIS CREATOR IN THE CURRENT DATABASE.</div>
                )}
              </div>
            </div>

            <div style={{ borderLeft: '2px solid #333', paddingLeft: '20px' }}>
              <p style={{ color: '#DC143C', fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px', fontWeight: 'bold' }}>03 // The Mark</p>
              <p style={{ color: '#ccc', fontSize: '16px', lineHeight: 1.6, margin: '0 0 20px 0', maxWidth: '600px' }}>
                The final mark of authenticity. A vow of origin. Signed by the Creator.
              </p>
              <div style={{ color: '#fff', fontSize: '48px', fontFamily: 'serif', fontStyle: 'italic', letterSpacing: '-2px' }}>
                {artist.signature}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- THE ARTIST CARD ---
const ArtistCard = ({ artist, inventory }) => {
  const [imgHover, setImgHover] = useState(false);
  const [showCollab, setShowCollab] = useState(false);

  return (
    <>
      <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: '1000px', backgroundColor: '#000', border: '1px solid #333', padding: '40px', position: 'relative', marginBottom: '80px' }}>
        
        <div style={{ position: 'absolute', top: 0, left: 0, width: '30px', height: '30px', borderTop: '4px solid #DC143C', borderLeft: '4px solid #DC143C' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: '30px', height: '30px', borderTop: '4px solid #DC143C', borderRight: '4px solid #DC143C' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '30px', height: '30px', borderBottom: '4px solid #DC143C', borderLeft: '4px solid #DC143C' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '30px', height: '30px', borderBottom: '4px solid #DC143C', borderRight: '4px solid #DC143C' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #333', paddingBottom: '15px', marginBottom: '30px' }}>
          <div>
            <p style={{ color: '#DC143C', fontSize: '10px', fontWeight: 'bold', margin: 0, letterSpacing: '2px' }}>SIGNATURA DATABASE</p>
            <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: '900', margin: 0 }}>ARTIST CREDENTIALS</h2>
          </div>
          <div style={{ textAlign: 'right', color: '#fff', fontSize: '12px', fontFamily: 'monospace' }}>
            <p style={{ color: '#DC143C', margin: 0 }}>ID-{artist.id}</p>
            <p style={{ margin: '5px 0 0 0' }}>{artist.tier}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          
          <div onMouseEnter={() => setImgHover(true)} onMouseLeave={() => setImgHover(false)} style={{ width: '320px', flexShrink: 0, cursor: 'crosshair', position: 'relative' }}>
            <div style={{ border: '2px solid #fff', position: 'relative', overflow: 'hidden' }}>
              <TargetLines active={imgHover} />
              <motion.img src={artist.photo || "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop"} animate={{ scale: imgHover ? 1.05 : 1 }} style={{ width: '320px', height: '400px', objectFit: 'cover', display: 'block', filter: 'grayscale(100%)' }} alt={artist.name} />
            </div>
            
            <button 
              onClick={() => setShowCollab(true)}
              style={{ width: '100%', backgroundColor: '#DC143C', color: '#000', border: 'none', textAlign: 'center', fontWeight: '900', fontSize: '12px', padding: '12px 8px', marginTop: '10px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '2px', transition: 'all 0.3s' }}
              onMouseOver={(e) => { e.target.style.backgroundColor = '#fff'; }}
              onMouseOut={(e) => { e.target.style.backgroundColor = '#DC143C'; }}
            >
              COLLABORATION // VIEW ASSETS
            </button>
          </div>

          <div style={{ flex: 1, minWidth: '350px' }}>
            <div style={{ borderLeft: '4px solid #DC143C', paddingLeft: '15px', marginBottom: '30px' }}>
              <p style={{ color: '#DC143C', fontSize: '10px', margin: 0 }}>FULL NAME</p>
              <h3 style={{ color: '#fff', fontSize: '48px', fontWeight: '900', margin: 0, lineHeight: 1 }}>{artist.name}</h3>
            </div>

            <div style={{ border: '2px solid #fff', width: '100%' }}>
              <div style={{ display: 'flex', borderBottom: '2px solid #fff' }}>
                <div style={{ width: '180px', padding: '15px', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', fontSize: '10px' }}>FAVORITE CLOTHING</div>
                <div style={{ padding: '15px', color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>{artist.favoriteClothing}</div>
              </div>
              <div style={{ display: 'flex', borderBottom: '2px solid #fff' }}>
                <div style={{ width: '180px', padding: '15px', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', fontSize: '10px' }}>FAVORITE COLOR</div>
                <div style={{ padding: '15px', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '30px', height: '30px', backgroundColor: artist.favoriteColorHex || '#DC143C', border: '2px solid #fff' }} />
                  <span style={{ fontSize: '16px' }}>{artist.favoriteColorHex}</span>
                </div>
              </div>
              <div style={{ display: 'flex' }}>
                <div style={{ width: '180px', padding: '15px', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', fontSize: '10px' }}>SIGNATURE</div>
                <div style={{ padding: '15px', color: '#fff', fontSize: '32px', fontStyle: 'italic', fontFamily: 'serif' }}>{artist.signature}</div>
              </div>
            </div>

            <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '3px', height: '45px', alignItems: 'flex-end', paddingRight: '20px' }}>
                  {[...Array(60)].map((_, i) => (<div key={i} style={{ backgroundColor: '#fff', width: '3.5px', height: Math.random() > 0.5 ? '100%' : '70%' }} />))}
                </div>
                <p style={{ color: '#666', fontSize: '8px', marginTop: '12px', letterSpacing: '3px', fontFamily: 'monospace' }}>SIG-{artist.id}-AUTH-SECURED</p>
              </div>
              <div style={{ textAlign: 'right', minWidth: '150px' }}>
                <p style={{ color: '#DC143C', fontSize: '9px', margin: 0, fontWeight: 'bold', letterSpacing: '2px' }}>STATUS</p>
                <p style={{ color: '#fff', fontSize: '24px', fontWeight: '900', margin: 0, letterSpacing: '3px' }}>VERIFIED</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #333', marginTop: '40px', paddingTop: '15px', fontFamily: 'monospace', fontSize: '10px', color: '#666' }}>
          <p style={{ margin: 0 }}>CLASSIFICATION: <span style={{ color: '#DC143C', fontWeight: 'bold' }}>{artist.classification}</span></p>
          <p style={{ margin: 0 }}>ISSUED: {artist.issuedDate}</p>
        </div>
      </motion.div>

      <AnimatePresence>
        {showCollab && <CollabModal artist={artist} inventory={inventory} onClose={() => setShowCollab(false)} />}
      </AnimatePresence>
    </>
  );
};

// --- MAIN COMPONENT ---
// Receives BOTH artists and inventory from App.jsx
const Artists = ({ artists, inventory }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredArtists = artists.filter(artist => 
    artist.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', paddingTop: '250px', paddingBottom: '100px', paddingLeft: '20px', paddingRight: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ maxWidth: '1000px', width: '100%', marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ color: '#fff', fontSize: '72px', fontWeight: '900', textTransform: 'uppercase', margin: 0, letterSpacing: '-2px', lineHeight: '1.1' }}>Personnel Roster</h1>
        <p style={{ color: '#DC143C', fontSize: '12px', letterSpacing: '6px', textTransform: 'uppercase', marginTop: '15px' }}>Classified Access Only // Secure Database</p>
        
        <div style={{ marginTop: '50px', position: 'relative', maxWidth: '500px', margin: '50px auto 0 auto' }}>
          <input type="text" placeholder="SEARCH BY NAME OR ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', backgroundColor: '#000', border: '2px solid #333', color: '#fff', padding: '18px 25px', fontFamily: 'monospace', fontSize: '12px', letterSpacing: '2px', outline: 'none', transition: 'border-color 0.3s' }} onFocus={(e) => e.target.style.borderColor = '#DC143C'} onBlur={(e) => e.target.style.borderColor = '#333'} />
        </div>
      </div>

      <AnimatePresence>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '60px' }}>
          {filteredArtists.length > 0 ? (
            filteredArtists.map((artist) => (<ArtistCard key={artist.id} artist={artist} inventory={inventory} />))
          ) : (
            <p style={{ color: '#666', fontFamily: 'monospace', marginTop: '100px', letterSpacing: '4px' }}>NO MATCHING RECORDS FOUND IN DATABASE.</p>
          )}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default Artists;