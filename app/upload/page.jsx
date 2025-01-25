"use client"
import React, { useRef, useState } from 'react'
import { toast } from 'react-toastify';

const page = () => {
  const [file, setFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const fileInputRef = useRef(null);

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!file) {
      toast.warn("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      });

      // Check if the response is JSON before trying to parse it
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();

        if (result.success) {
          toast.success(`File uploaded successfully: ${result.file.filename}`);
          setFile(null);
          fileInputRef.current.value = "";
          setUploadedFiles([...uploadedFiles, result.file]);
        } else {
          toast.error("File upload failed.");
        }
      } else {
        const text = await response.text();
        alert(`Error: Received non-JSON response: ${text}`);
        console.error("Server returned non-JSON response:", text);
        setFile("");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("An error occurred while uploading the file.");
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  return (
    <div className='container w-96 mx-auto rounded-2xl border-2 border-slate-400 shadow-slate-800 shadow-xl mt-32 p-5'>
        <h2 className='text-white font-semibold text-center my-2'>File Upload</h2>
        <form onSubmit={handleUpload} className='w-full'>
          <div className="w-full text-center"> 
            <input name='file' type="file" onChange={handleFileChange} className='bg-slate-100 w-full' ref={fileInputRef} />
            <button type="submit" className='mt-5 p-1 rounded-lg hover:text-white hover:bg-transparent border-[1px] hover:border-white  bg-slate-100 mx-auto'>Upload</button>
          </div>
        </form>
    </div>
  )
}

export default page