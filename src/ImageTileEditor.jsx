import React, { useState, useRef, useCallback } from 'react';
import { Edit, X, Move } from 'lucide-react';
import './ImageTileEditor.css';

const ImageTileEditor = () => {
  const [tiles, setTiles] = useState([]);
  const [showItemList, setShowItemList] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const [draggedTile, setDraggedTile] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const containerRef = useRef(null);

  const availableItems = [
    'Product Label',
    'Price Tag',
    'Size Info',
    'Material Info',
    'Brand Logo',
    'Rating',
    'Discount Badge',
    'Stock Status'
  ];

  const [preconfiguredTiles] = useState([
    { id: 'pre-1', name: 'Brand Logo', x: 50, y: 30, isPreconfigured: true },
    { id: 'pre-2', name: 'Price Tag', x: 200, y: 100, isPreconfigured: true }
  ]);

  React.useEffect(() => {
    if (tiles.length === 0) {
      setTiles(preconfiguredTiles);
    }
  }, [preconfiguredTiles, tiles.length]);

  const handleImageClick = (e) => {
    if (!isEditing || draggedTile || showItemList) return;
    if (!e.target.classList.contains('image-overlay')) return;

    const rect = containerRef.current.getBoundingClientRect();
    // Calculate percentage positions like UI5
    const percentageX = ((e.clientX - rect.left) / rect.width) * 100;
    const percentageY = ((e.clientY - rect.top) / (rect.height * 2)) * 100;
    
    // Store both percentage and pixel positions
    setClickPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      percentX: percentageX.toFixed(2),
      percentY: percentageY.toFixed(2)
    });
    setShowItemList(true);

    console.log('Position in percentages:', `${percentageX.toFixed(2)},${percentageY.toFixed(2)}`);
  };

  const handleItemSelect = (itemName) => {
    const newTile = {
      id: `tile-${Date.now()}`,
      name: itemName,
      x: clickPosition.x - 52,
      y: clickPosition.y - 42,
      percentX: clickPosition.percentX,
      percentY: clickPosition.percentY,
      isPreconfigured: false
    };

    setTiles(prev => [...prev, newTile]);
    setShowItemList(false);
    
    // Log both pixel and percentage positions
    console.log('New tile added:', {
      ...newTile,
      position: `${newTile.percentX},${newTile.percentY}`
    });
  };

  const handleMouseDown = (e, tile) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isEditing) return;

    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - tile.x;
    const offsetY = e.clientY - rect.top - tile.y;

    setDraggedTile(tile.id);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseMove = useCallback((e) => {
    if (!draggedTile || !isEditing) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width - 104, e.clientX - rect.left - dragOffset.x));
    const y = Math.max(0, Math.min(rect.height - 84, e.clientY - rect.top - dragOffset.y));
    
    // Calculate percentages like UI5
    const percentageX = ((x + 52) / rect.width) * 100; // Add half tile width (104/2)
    const percentageY = ((y + 42) / (rect.height * 2)) * 100; // Add half tile height (84/2)

    setTiles(prev => {
      const updated = prev.map(tile =>
        tile.id === draggedTile ? { 
          ...tile, 
          x, 
          y,
          percentX: percentageX.toFixed(2),
          percentY: percentageY.toFixed(2)
        } : tile
      );
      // Log both pixel and percentage positions
      console.log('Tile positions:', updated.map(t => ({ 
        id: t.id, 
        name: t.name, 
        pixelPos: { x: t.x, y: t.y },
        position: `${t.percentX},${t.percentY}`
      })));
      return updated;
    });
  }, [draggedTile, dragOffset, isEditing]);

  const handleMouseUp = useCallback(() => {
    setDraggedTile(null);
    setDragOffset({ x: 0, y: 0 });
  }, [draggedTile]);

  React.useEffect(() => {
    if (draggedTile) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedTile, handleMouseMove, handleMouseUp]);

  const deleteTile = (tileId) => {
    setTiles(prev => prev.filter(tile => tile.id !== tileId));
  };

  const saveTileConfig = () => {
    console.log('Saved tile configuration:', tiles);
    alert('Tile configuration saved! Check console for details.');
  };

  return (
    <div>
      <div className="toolbar">
        <button onClick={() => setIsEditing(!isEditing)} className={`btn ${isEditing ? 'btn-active' : ''}`}>
          <Edit size={16} />
          {isEditing ? 'Exit Edit Mode' : 'Enter Edit Mode'}
        </button>

        <button onClick={saveTileConfig} className="btn btn-save">
          Save Config
        </button>

        <div className="info">
          Tiles: {tiles.length} | Edit Mode: {isEditing ? 'ON' : 'OFF'}
        </div>
      </div>

      <div className="image-container" style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
        {isEditing && (
          <div className="edit-indicator">
            <Edit size={20} />
          </div>
        )}

        <div
          ref={containerRef}
          className="image-area"
          onClick={handleImageClick}
          style={{ width: '100%', height: '100%', position: 'relative' }}
        >
          <div className="image-overlay" style={{ width: '100%', height: '100%' }}></div>

          {isEditing && tiles.length === 0 && (
            <div className="instruction">
              <div>
                <div className="instruction-title">Click anywhere on the machinery to add annotation tiles</div>
                <div className="instruction-sub">Edit mode is active</div>
              </div>
            </div>
          )}

          {tiles.map((tile) => (
            <div
              key={tile.id}
              className={`tile ${isEditing ? 'tile-editing' : ''} ${draggedTile === tile.id ? 'tile-dragging' : ''} ${tile.isPreconfigured ? 'tile-preconfigured' : ''}`}
              style={{
                left: `${tile.x}px`,
                top: `${tile.y}px`
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, tile);
              }}
            >
              <span className="tile-label">{tile.name}</span>

              {isEditing && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTile(tile.id);
                    }}
                    className="tile-delete"
                  >
                    <X size={12} />
                  </button>

                  <div className="tile-drag-handle">
                    <Move size={12} />
                  </div>
                </>
              )}

              {tile.isPreconfigured && (
                <div className="tile-pre-indicator">PRE</div>
              )}
            </div>
          ))}

          {showItemList && (
            <>
              <div className="dropdown-backdrop" onClick={() => setShowItemList(false)}></div>
              <div
                className="dropdown"
                style={{
                  left: `${Math.min(clickPosition.x, containerRef.current?.clientWidth - 200)}px`,
                  top: `${Math.min(clickPosition.y, containerRef.current?.clientHeight - 300)}px`
                }}
              >
                <div className="dropdown-header">
                  <span>Select Item Type</span>
                  <button onClick={() => setShowItemList(false)}><X size={16} /></button>
                </div>
                <div className="dropdown-items">
                  {availableItems.map((item, index) => (
                    <button key={index} onClick={() => handleItemSelect(item)}>{item}</button>
                  ))}
                </div>
                <button onClick={() => setShowItemList(false)} className="dropdown-cancel">Cancel</button>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
};

export default ImageTileEditor;
