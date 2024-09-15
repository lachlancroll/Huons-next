"use client";

import React, { useState } from 'react';

const FileUpload = ({setPdfUrl, setPdfArray, setAnswers, file, setFile}) => {
  const [message, setMessage] = useState('');


  // Handle file selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      setMessage('Please upload a valid PDF file.');
    }
  };

  // Handle file submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', file);

    const pdfBlob = new Blob([file], { type: 'application/pdf' });
    const pdfBlobUrl = URL.createObjectURL(pdfBlob);
    console.log("yayy")
    setPdfUrl(pdfBlobUrl); // Set the URL for the PdfViewer

    try {
      const response = await fetch('http://192.168.1.114:4000/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json(); // Parse the JSON response (array of PDFs)
        // array = []
        setPdfArray(data.pdf_list); // Store the array in state
        console.log(data.answers);
        setAnswers(data.answers);
        setMessage('File uploaded successfully!');
      } else {
        const errorText = await response.text(); // Get the error message from the response
        setMessage(`File upload failed: ${errorText}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error); // Log the error
      setMessage('Error uploading file.');
    }
  };

    return (
      <div>
        <h2>Upload PDF File</h2>
        <form onSubmit={handleSubmit}>
          <input type="file" accept="application/pdf" onChange={handleFileChange} />
          <button type="submit">Upload</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    );
  };

  export default FileUpload;
