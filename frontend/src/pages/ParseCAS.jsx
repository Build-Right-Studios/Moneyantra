import React, { useState, useEffect } from 'react'
import cas1 from '../components/images/CAS1.png'
import cas2 from '../components/images/CAS2.png'
import { IoCloudUploadOutline } from "react-icons/io5";
import { TbLockPassword } from "react-icons/tb";
import Footer from '../components/Footer';
import axiosInstance from '../utils/axiosInstance';

function ParseCAS() {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('');
    const [password, setPassword] = useState(''); // State for the password input
    const [isChecked, setIsChecked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Ensure currentUser is robustly set.
    // Consider how 'loggedInUser' is stored in localStorage.
    // It should be a string (username, user ID). If it's not set, 'defaultUser' will be used.
    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.type === "application/pdf") {
            setFile(selected);
            setStatus(`Selected: ${selected.name}`);
        } else {
            setFile(null);
            setStatus('Please upload a valid PDF');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert('Please select a file first.');
            return;
        }
        // This alert is good and should prevent proceeding if 'password' state is empty.
        if (!password) {
            alert('Please Enter Password.');
            return;
        }
        if (!isChecked) {
            alert('Please accept the disclaimer to proceed.');
            return;
        }

        setIsLoading(true);

        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('password', password); // Correctly appending the password

        // --- NEW DEBUGGING LOGS BEFORE SENDING ---
        console.log("Frontend Debug: File selected:", file ? file.name : "No file");
        console.log("Frontend Debug: Password state value:", password); // Log the actual value of password
        // console.log("Frontend Debug: Current user value:", currentUser);
        // console.log("Frontend Debug: Disclaimer checked:", isChecked);
        // --- END NEW DEBUGGING LOGS ---

        try {
            const response = await axiosInstance.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data' // Important for FormData
                }
            });

            if (response.status === 201) {
                console.log("File uploaded and password-protected successfully:", response.data.message);
                console.log("File ID:", response.data.fileId);
                console.log("Protected File Name:", response.data.fileName);
                setStatus(`${response.data.message} File ID: ${response.data.fileId}`);
                alert("File uploaded and password-protected successfully!");
                // Clear form fields on success
                setFile(null);
                setPassword('');
                setIsChecked(false);
            } else {
                console.error("File upload failed with status:", response.status, response.data.message);
                setStatus(`Upload failed: ${response.data.message || 'Unknown error'}`);
                alert("File upload failed. Please check console for details.");
            }
        } catch (error) {
            console.error("File upload error:", error);
            let errorMessage = "An unexpected error occurred during file upload.";
            if (error.response) {
                console.error("Error response data:", error.response.data);
                console.error("Error status:", error.response.status);
                if (error.response.data && error.response.data.message) {
                    errorMessage = `Upload failed: ${error.response.data.message}`;
                }
            } else if (error.request) {
                errorMessage = "No response received from server. Please check your network connection.";
            } else {
                errorMessage = `Error setting up request: ${error.message}`;
            }
            setStatus(`${errorMessage}`);
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='item-center justify-center'>
            <div className='text-[#6f779d] text-4xl open-sans-moneyantra text-center'>Upload CAS</div>
            <div className='text-[#00b3be] text-2xl mt-3 text-center lg:text-4xl underline'>Instructions to download CAS</div>
            <div className='text-black px-4'>
                <ul className='list-disc space-y-2 mt-4 lg:text-xl'>
                    <li className='roboto-condensed-moneyantra'>
                        Go to - <a href="https://www.camsonline.com/Investors/Statements/Consolidated-Account-Statement" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">CAMS</a>
                    </li>
                    <li className='roboto-condensed-moneyantra'>Select Statement Type - Detailed</li>
                    <li className='roboto-condensed-moneyantra'>Select Period - Put start date and end date as the period from when you started investing to current date</li>
                    <li className='roboto-condensed-moneyantra'>Select Folio Listing as - Transacted folios and folios with Balances</li>
                    <li className='roboto-condensed-moneyantra'>Enter your email address and a password (this would be used to open and parse the CAS)</li>
                    <li className='roboto-condensed-moneyantra'>You will receive CAS over email in PDF format, upload that file on this page.</li>
                </ul>
            </div>
            <div className='w-full px-4'>
                <img src={cas1} alt="" />
            </div>
            <div className='w-full px-4'>
                <img src={cas2} alt="" />
            </div>
            <br />
            <div className='mx-auto justify-center md:w-[80%] px-4 flex flex-col'>
                <label className="cursor-pointer shadow-2xl rounded-2xl ">
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <div className="md:h-[250px] border-dashed border-[#38b6ff] border-2 rounded-xl flex items-center justify-center flex-col py-4 hover:bg-blue-50 transition">
                        <IoCloudUploadOutline size={40} className="text-[#33658a]" />
                        <p className="text-[#33658a] font-medium mt-2 text-2xl">Upload PDF</p>
                    </div>
                </label>

                {status && <p className="mt-4 text-sm text-gray-700">{status}</p>}
                <br />
                <br></br>
                <div className='text-3xl flex flex-row items-center justify-center'>
                    <TbLockPassword size={30} />
                    <div>Password</div>
                </div>
                <div className='cursor-pointer flex flex-row items-center justify-center gap-4'>

                    <input
                        type="password"
                        value={password} // Crucial: ensure this is bound to the state
                        onChange={(e) => setPassword(e.target.value)} // Crucial: ensure state updates
                        className='border-2 border-[#f26419] w-2/4 rounded-lg px-2 h-[40px] text-center'
                    />
                </div>
                <br />
                <br />
                <div className='flex flex-col lg:flex-row lg:gap-5'>
                    <input
                        type="checkbox"
                        className='border border-black h-7 w-7'
                        checked={isChecked}
                        onChange={(e) => setIsChecked(e.target.checked)}
                    />

                    <div>Disclaimer: By uploading your CAS, you are allowing the file to be stored temporarily in a secured manner on our servers for parsing and running the calculations. This data would not be shared with any other party and would not be used for any other purpose apart from using to run the calculations and analyzing the data. Please click accept to proceed with the process.</div>
                </div>

                <button
                    onClick={handleUpload}
                    disabled={!isChecked || isLoading} // Disable button when not checked or loading
                    className={`mt-4 px-4 py-2 rounded text-white
                    ${isChecked && !isLoading ? 'bg-[#33658a] hover:bg-[#33658a]' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                    {isLoading ? 'Uploading & Protecting...' : 'Upload'}
                </button>
            </div>
            <br />
            <br />
            <Footer />
        </div>
    )
}

export default ParseCAS;