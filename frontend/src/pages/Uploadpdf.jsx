import React, { useState } from 'react';

export default function Uploadpdf() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus('Please select a PDF file.');
      return;
    }

    setStatus('Uploading...');

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const res = await fetch('http://localhost:8080/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setStatus(`File uploaded! File ID: ${data.fileId}`);
      } else {
        setStatus(`Upload failed: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Upload error: ${error.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-2xl shadow-xl bg-white dark:bg-gray-800">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Upload PDF to Google Drive</h1>
      <form onSubmit={handleUpload} className="space-y-4">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-700 focus:outline-none"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition duration-300"
        >
          Upload
        </button>
      </form>
      {status && (
        <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">{status}</p>
      )}
    </div>
  );
}
