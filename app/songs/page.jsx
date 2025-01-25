"use client"
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';

const page = () => {
    const [uploadedFiles, setUploadedFiles] = useState([]);


    useEffect(() => {
      const fetchFiles = async () => {
        try {
          const response = await fetch("http://localhost:3001/");
          const result = await response.json();
          if (result.success) {
            console.log(result.files);
            setUploadedFiles(result.files);
          } else {
            toast.error("Failed to fetch uploaded files.");
          }
        } catch (error) {
          console.error("Error fetching files:", error);
          toast.error("An error occurred while fetching uploaded files.");
        }
      };
      fetchFiles();
    }, []);

    const handleDeleteFile = async (filename) => {
      try {
        const userConfirmed = confirm(`Do you want to delete ${filename}?`);
        if (!userConfirmed) {
          return; // Exit if canceled
        }
    
        const url = `http://localhost:3001/uploads/${filename}`;
        const response = await fetch(url, { method: 'DELETE' });
    
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete the file.');
        }
    
        const result = await response.json();
        toast.success(result.message);
    
        // Directly update the state to remove the deleted file
        setUploadedFiles(prevFiles => prevFiles.filter(file => file.filename !== filename));
      } catch (err) {
        toast.error(err.message || 'An error occurred while deleting the file.');
      }
    };
    

  return (
    <>
      <div className='container mx-auto w-full mt-12 text-white'>
        <h3 className='mx-auto font-bold text-center text-2xl'>Uploaded Songs</h3>
        {uploadedFiles.length > 0 ?
          uploadedFiles.map((file, index) => (
        <div key={index} className="mb-2 border-2 w-96 mx-auto rounded-lg border-white px-4 flex justify-between items-center">
          <div>
            <p>{file.filename}</p>
            <p>{file._id}</p>
          </div>
          <div>
            <i className="fa-solid fa-trash" onClick={() => {handleDeleteFile(file.filename)}}></i>
          </div>
        </div>
        )) : 
        <>
          <div className="text-center">No songs uploaded
            <Link href="/upload" className='text-center text-blue-700 text-sm ml-2' >Add songs</Link>
          </div>
        </>
      }
      </div>
    </>
  )
}

export default page