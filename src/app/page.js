"use client";

import FileUpload from "@/components/FileUpload";
import { useState } from "react";
import PdfViewer from "@/components/PdfViewer";

export default function Home() {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [quesPdfArray, setQuesPdfArray] = useState(null);
  const [ansPdfArray, setAnsPdfArray] = useState(null);
  const [answers, setAnswers] = useState(null);
  const [answerIndex, setAnswerIndex] = useState(0);
  const [square, setSquare] = useState(null);
  const [pageNumber, setPageNumber] = useState(1); // Store the current page number
  const [file, setFile] = useState(null);




  const createDownloadLink = (pdfData, title) => {
    // Decode Base64 to binary data
    const byteCharacters = atob(pdfData);
    const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    // Generate download link
    const url = URL.createObjectURL(blob);
    return (
      <li key={title}>
        <a href={url} download={`${title}.pdf`}>Download {title}</a>
      </li>
    );
  };

  // Handle file submission
  const handleSubmitAns = async (event) => {
    event.preventDefault();

    // Prepare FormData to include both the answers and the PDF file
    const formData = new FormData();
    formData.append('pdf', file);  // Assuming `file` is your file object
    formData.append('answers', JSON.stringify(answers));  // Send `answers` as a JSON string

    try {
      const response = await fetch('http://192.168.1.114:4000/get_answers', {
        method: 'POST',
        body: formData,  // Send form data
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data)
        setAnsPdfArray(data.pdf_list);  // Update state with the received PDF list
      } else {
        const errorText = await response.text();
        console.error('Server error:', errorText);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };


  const handleCreateSquare = (newSquare) => {
    setSquare(newSquare);
    setAnswers(prev => {
      // Create a shallow copy of the `prev` array
      const updatedAnswers = [...prev];

      // Ensure we are also copying the array we are updating
      updatedAnswers[answerIndex] = [...updatedAnswers[answerIndex]];

      // Push the new data to the correct place in the array
      //console.log(updatedAnswers[answerIndex].length)
      console.log(newSquare)
      const topY = (newSquare.y - newSquare.rect.top) / (window.innerHeight * 0.8)
      console.log("height", newSquare.height)
      const bottomY = ((newSquare.y - newSquare.rect.top) + newSquare.height) / (window.innerHeight * 0.8)
      if (updatedAnswers[answerIndex].length < 3) {
        updatedAnswers[answerIndex].push([pageNumber, [topY, bottomY]]);
      } else {
        updatedAnswers[answerIndex][3] = [pageNumber, [topY, bottomY]];
      }

      console.log(updatedAnswers)

      return updatedAnswers; // Return the updated array
    });
  }

  return (
    <div>
      <FileUpload setPdfUrl={setPdfUrl} setPdfArray={setQuesPdfArray} setAnswers={setAnswers} file={file} setFile={setFile} />
      <div className="container">
        <div className="element">{answers ? <PdfViewer pdfUrl={pdfUrl} square={square} onCreateSquare={handleCreateSquare} pageNumber={pageNumber} setPageNumber={setPageNumber} /> : null}</div>
        {answers && <div className="element">
          <div>Please highlight {`${answers[answerIndex][0]} ${answers[answerIndex][1]}`}</div>
          <div className="container">
            <div className="element"><button onClick={() => { answerIndex > 0 && setAnswerIndex(prev => prev - 1) }}>{"<"}</button></div>
            <div className="element"><button onClick={() => setAnswerIndex(prev => prev + 1)}>{">"}</button></div>
          </div>
          <div>
            {answers[answerIndex].length <= 3 ? "X" : "✓"}
            <button onClick={handleSubmitAns}>submit answers</button>
          </div>
        </div>}
      </div>
      {quesPdfArray && (
        <div>
          <h3>Download PDFs:</h3>
          <ul>
            {quesPdfArray.map((pdfObj) => createDownloadLink(pdfObj.pdf, pdfObj.title))}
          </ul>
        </div>
      )}
      {ansPdfArray && (
        <div>
          <h3>Download Answer PDFs:</h3>
          <ul>
            {ansPdfArray.map((pdfObj) => createDownloadLink(pdfObj.pdf, pdfObj.title))}
          </ul>
        </div>
      )}
    </div>
  );
}