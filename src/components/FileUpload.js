"use client";

import React, { useState } from 'react';
import Spinner from './Spinner';
import DropSelect from './DropSelect';

const FileUpload = ({setPdfUrl, setPdfArray, setAnswers, file, setFile}) => {
  const [message, setMessage] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const [format, setFormat] = useState(0)
  const [formatOptions, setFormatOptions] = useState([{option: "James Ruse", value: "^(100|[1-9]?[0-9])\\)$"}, {option: "HSC", value: "^Question\\s+\\d+.*$"}])

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
    formData.append('pattern', format);
    formData.append('quesNum', quesNum);
    //formData.append("format", formatOptions[formatIndex])

    const pdfBlob = new Blob([file], { type: 'application/pdf' });
    const pdfBlobUrl = URL.createObjectURL(pdfBlob);
    setPdfUrl(pdfBlobUrl); // Set the URL for the PdfViewer
    setIsDisabled(true);
    try {
      const response = await fetch('http://192.168.68.55:4000/upload', {
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

  const handleFormatChange = (event) => {
    console.log(event)
    setFormat(event.target.value);
  }

  const [quesNum, setQuesNum] = useState(20);
  const [tempQuesNum, setTempQuesNum] = useState(20);
  const maxQues = 40

  const handleQuesChange = (event) => {
    const num = Number(event.target.value);  // Convert the value to a number
    if (num >= 1 && num <= maxQues) {
      setQuesNum(num);
    } else {
      setTempQuesNum
      setQuesNum(quesNum); // Reset to current page if invalid
    }
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
        <DropSelect value={format} options={formatOptions} onChange={handleFormatChange}></DropSelect>
        Input final question page: 
        <input
          type="number"
          id="pagenum"
          value={tempQuesNum}
          onChange={(e) => setTempQuesNum(e.target.value)}
          min={1}
          max={maxQues}
          onBlur={handleQuesChange}
        />
      </div>
    );
  };

  export default FileUpload;
