"use client";

import React, { useState, useEffect, useRef } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/webpack';

// Set the worker for PDF.js
GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.js'; // Use a static URL

const PdfViewer = ({ pdfUrl, numPages, setNumPages, pageNumber, setPageNumber, onCreateSquare, answerIndex, answers }) => {
  const [square, setSquare] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null); // Store the loaded PDF document
  const [tempPageNum, setTempPageNum] = useState(pageNumber);

  const [isDrawing, setIsDrawing] = useState(false);  // Track when the user is drawing
  const [startCoords, setStartCoords] = useState({ x: 0, y: 0 });  // Store the starting coordinates

  const canvasRef = useRef(null); // Ref for the canvas element

  useEffect(() => {
    console.log("uh oh answer index or page number changed");
    if (!answers) {
      return;
    }
    if (answers[answerIndex].length < 4 || answers[answerIndex][3][0] != pageNumber) {
      setSquare(null);
    } else if (answers[answerIndex][3][0] == pageNumber) {
      const rect = canvasRef.current.getBoundingClientRect();
      const y1 = answers[answerIndex][3][1][0] * (window.innerHeight * 0.8) + rect.top + window.scrollY;
      const y2 = answers[answerIndex][3][1][1] * (window.innerHeight * 0.8) + rect.top + window.scrollY;
      const newSquare = {
        x: rect.left,
        y: y1,
        width: rect.right - rect.left,
        height: Math.abs(y1 - y2),
        rect: rect
      };
      setSquare(newSquare);
    }
  }, [answerIndex, pageNumber])

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
      renderPage(pageNumber);
    }
    setTempPageNum(pageNumber);
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
    console.log("hello");
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY + window.scrollY;  // Adjust for page scroll

    setStartCoords({ x, y });
    setIsDrawing(true);
  };

  const handleMouseUp = (event) => {
    if (isDrawing) {
      const rect = event.target.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY + window.scrollY - 10;  // Adjust for page scroll

      const newSquare = {
        x: startCoords.x,
        y: startCoords.y,
        width: Math.abs(x - startCoords.x),
        height: Math.abs(y - startCoords.y),
        rect: rect
      };

      setSquare(newSquare);
      onCreateSquare(newSquare);
      setIsDrawing(false);
    }
  };


  const handleMouseMove = (event) => {
    if (isDrawing) {
      const rect = event.target.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY + window.scrollY - 10;  // Adjust for page scroll

      const newSquare = {
        x: startCoords.x,
        y: startCoords.y,
        width: Math.abs(x - startCoords.x),
        height: Math.abs(y - startCoords.y),
        rect: rect
      };
      setSquare(newSquare);
    }
  };

  const handlePageChange = (event) => {
    const num = Number(event.target.value);  // Convert the value to a number
    if (num >= 1 && num <= numPages) {
      setPageNumber(num);
    } else {
      setTempPageNum(pageNumber); // Reset to current page if invalid
    }
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{ border: '1px solid black', marginBottom: '10px', height: "80vh" }}
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
            backgroundColor: 'rgba(255, 255, 0, 0.5)',
            pointerEvents: 'none'
          }}
        />
      )}
      <div>
        <button className="button" onClick={goToPreviousPage} disabled={pageNumber <= 1}>
          Previous Page
        </button>
        <span> Page </span>
        <input
          type="number"
          id="pagenum"
          value={tempPageNum}
          onChange={(e) => setTempPageNum(e.target.value)}
          min={1}
          max={numPages}
          onBlur={handlePageChange}
        />
        <span> of {numPages} </span>
        <button className="button" onClick={goToNextPage} disabled={pageNumber >= numPages}>
          Next Page
        </button>
      </div>
    </div>
  );
};

export default PdfViewer;
