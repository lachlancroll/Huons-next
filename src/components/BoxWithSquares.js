"use client";

import React, { useState } from 'react';

const BoxWithSquares = () => {
  const [squares, setSquares] = useState([]);  // Array to store squares with their coordinates
  const [isDrawing, setIsDrawing] = useState(false);  // Track when the user is drawing
  const [startCoords, setStartCoords] = useState({ x: 0, y: 0 });  // Store the starting coordinates

  const handleMouseDown = (event) => {
    const rect = event.target.getBoundingClientRect();  // Get bounding rect to calculate relative coordinates
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Store the starting point and mark as drawing
    setStartCoords({ x, y });
    setIsDrawing(true);
  };

  const handleMouseUp = (event) => {
    if (isDrawing) {
      const rect = event.target.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Add new square with starting coordinates to the array
      const newSquare = {
        x: startCoords.x,
        y: startCoords.y,
        width: Math.abs(x - startCoords.x),
        height: Math.abs(y - startCoords.y),
      };

      // Update the squares array
      setSquares([...squares, newSquare]);

      // Log the coordinates to the console
      console.log(`Square created at (${newSquare.x}, ${newSquare.y})`);

      setIsDrawing(false);
    }
  };

  const handleMouseMove = (event) => {
    if (isDrawing) {
      // Optional: You can add logic here to display a preview of the square while dragging
    }
  };

  return (
    <div
      style={{
        width: '300px',
        height: '300px',
        backgroundColor: 'black',
        position: 'relative',
        margin: '20px',
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      {squares.map((square, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: `${square.y}px`,
            left: `${square.x}px`,
            width: `${square.width}px`,
            height: `${square.height}px`,
            backgroundColor: 'red',
          }}
        />
      ))}
    </div>
  );
};

export default BoxWithSquares;
