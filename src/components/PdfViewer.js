"use client";

import React, { useState, useEffect, useRef } from 'react';
import { pdfjs } from 'pdfjs-dist';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/webpack';

// Set the worker for PDF.js
GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.js'; // Use a static URL

const PdfViewer = ({ pdfUrl, square, pageNumber, setPageNumber, onCreateSquare}) => {
  const [pdfDoc, setPdfDoc] = useState(null); // Store the loaded PDF document
  const [numPages, setNumPages] = useState(null); // Store the total number of pages

  const [isDrawing, setIsDrawing] = useState(false);  // Track when the user is drawing
  const [startCoords, setStartCoords] = useState({ x: 0, y: 0 });  // Store the starting coordinates

  const canvasRef = useRef(null); // Ref for the canvas element

  useEffect(() => {
    const loadPdf = async () => {
      // Load the PDF document
      const loadingTask = getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setNumPages(pdf.numPages);
    };

    loadPdf();
  }, [pdfUrl]);

  useEffect(() => {
    if (pdfDoc) {
      // Render the page whenever the page number or pdf document changes
      renderPage(pageNumber);
    }
  }, [pdfDoc, pageNumber]);

  const renderPage = async (pageNum) => {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });

    // Get the canvas and context
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render the page on the canvas
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext).promise;
  };

  const goToNextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber((prevPage) => prevPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (pageNumber > 1) {
      setPageNumber((prevPage) => prevPage - 1);
    }
  };

  const handleMouseDown = (event) => {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY;  // Adjust for page scroll
    
    setStartCoords({ x, y });
    setIsDrawing(true);
  };
  
  const handleMouseUp = (event) => {
    if (isDrawing) {
      const rect = event.target.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY;  // Adjust for page scroll

      console.log(rect)
  
      const newSquare = {
        x: startCoords.x,
        y: startCoords.y,
        width: Math.abs(x - startCoords.x),
        height: Math.abs(y - startCoords.y),
        rect: rect
      };

      onCreateSquare(newSquare);
      setIsDrawing(false);
    }
  };
  

  const handleMouseMove = (event) => {
    if (isDrawing) {
      // Optional: You can add logic here to display a preview of the square while dragging
    }
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{ border: '1px solid black', marginBottom: '10px', height: "80vh"}}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
    />
    {square && (
        <div
          style={{
            position: 'absolute',
            top: `${square.y}px`,
            left: `${square.x}px`,
            width: `${square.width}px`,
            height: `${square.height}px`,
            backgroundColor: 'rgba(255, 255, 0, 0.5)',  // 50% transparent red
          }}
        />
      )}
      <div>
        <button onClick={goToPreviousPage} disabled={pageNumber <= 1}>
          Previous Page
        </button>
        <span> Page {pageNumber} of {numPages} </span>
        <button onClick={goToNextPage} disabled={pageNumber >= numPages}>
          Next Page
        </button>
      </div>
    </div>
  );
};

export default PdfViewer;
