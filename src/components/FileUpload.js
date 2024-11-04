"use client";

import React, { useState } from 'react';
import Spinner from './Spinner';
import DropSelect from './DropSelect';

const FileUpload = ({setPdfUrl, setPdfArray, setAnswers, file, setFile}) => {
  const [message, setMessage] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const [formatIndex, setFormatIndex] = useState(0)
  const [formatOptions, setFormatOptions] = useState(["James Ruse", "HSC"])

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
    //formData.append("format", formatOptions[formatIndex])

    const pdfBlob = new Blob([file], { type: 'application/pdf' });
    const pdfBlobUrl = URL.createObjectURL(pdfBlob);
    setPdfUrl(pdfBlobUrl); // Set the URL for the PdfViewer
    setIsDisabled(true);
    try {
      const response = await fetch('http://192.168.68.53:4000/upload', {
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
    setIsDisabled(false);
  };

  const handleFormatChange = (index) => {
    setFormatIndex(index);
  }

    return (
      <div>
        <h2>Upload PDF File</h2>
        <form>
          <input type="file" accept="application/pdf" onChange={handleFileChange} />
          <button className={`button${isDisabled? "-disabled" : ""}`} type="submit" onClick={handleSubmit} disabled={isDisabled}> Upload</button>
          {isDisabled ? <Spinner/>: <></>}
        </form>
        {message && <p>{message}</p>}
        <DropSelect index={formatIndex} options={formatOptions} onChange={handleFormatChange}></DropSelect>
      </div>
    );
  };

  export default FileUpload;
