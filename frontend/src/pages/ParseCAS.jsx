import React, { useState } from 'react';
import cas1 from '../components/images/CAS1.png';
import cas2 from '../components/images/CAS2.png';
import { IoCloudUploadOutline } from "react-icons/io5";
import { TbLockPassword } from "react-icons/tb";
import Footer from '../components/Footer';
import axiosInstance from '../utils/axiosInstance';
import NavbarLogin from '../components/Navbarlogin'; 
import DisplayCAs from "../components/DisplayCAs";

function ParseCAS() {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('');
    const [password, setPassword] = useState(''); 
    const [isChecked, setIsChecked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [casData, setCasData] = useState(null); 

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
        if (!file || !password || !isChecked) {
            alert('Please ensure file, password, and disclaimer are set.');
            return;
        }

        setIsLoading(true);

        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('password', password);

        try {
            const response = await axiosInstance.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.status === 201) {
                console.log("Upload success:", response.data.message);
                setCasData(response.data.casData);
                alert("File uploaded successfully.");
                setFile(null);
                setPassword('');
                setIsChecked(false);
            } else {
                console.error("Upload failed:", response.status);
                setStatus(`Upload failed: ${response.data.message || 'Unknown error'}`);
            }
        } catch (error) {
            let errorMessage = "An unexpected error occurred.";
            if (error.response?.data?.message) {
                errorMessage = `Upload failed: ${error.response.data.message}`;
            }
            alert(errorMessage);
            console.error("Upload error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='item-center justify-center'>
            <NavbarLogin/>
            <div className='text-[#6f779d] text-4xl mt-4 open-sans-moneyantra text-center'>Upload CAS</div>
            <div className='text-[#00b3be] text-2xl mt-3 text-center lg:text-4xl underline'>Instructions to download CAS</div>
            <div className='text-black px-4'>
                <ul className='list-disc space-y-2 mt-4 lg:text-xl'>
                    <li className='roboto-condensed-moneyantra'>
                        Go to - <a href="https://www.camsonline.com/Investors/Statements/Consolidated-Account-Statement" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">CAMS</a>
                    </li>
                    <li className='roboto-condensed-moneyantra'>Select Statement Type - Detailed</li>
                    <li className='roboto-condensed-moneyantra'>Select Period - Start date to current date</li>
                    <li className='roboto-condensed-moneyantra'>Select Folio Listing as - Transacted folios and folios with Balances</li>
                    <li className='roboto-condensed-moneyantra'>Enter your email and password</li>
                    <li className='roboto-condensed-moneyantra'>You will receive CAS over email in PDF format. Upload it below.</li>
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
                <label className="cursor-pointer shadow-2xl rounded-2xl">
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

                <br />
            {casData && <DisplayCAs data={casData} />}
            <br />

                <div className='text-3xl flex flex-row items-center justify-center'>
                    <TbLockPassword size={30} />
                    <div>Password</div>
                </div>
                <div className='cursor-pointer flex flex-row items-center justify-center gap-4'>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='border-2 border-[#f26419] w-2/4 rounded-lg px-2 h-[40px] text-center'
                    />
                </div>

                <br />
                <div className='flex flex-col lg:flex-row lg:gap-5'>
                    <input
                        type="checkbox"
                        className='border border-black h-7 w-7'
                        checked={isChecked}
                        onChange={(e) => setIsChecked(e.target.checked)}
                    />
                    <div>
                        Disclaimer: By uploading your CAS, you allow it to be stored temporarily on our servers for parsing and analysis. This data will not be shared or reused. Please accept to proceed.
                    </div>
                </div>

                <button
                    onClick={handleUpload}
                    disabled={!isChecked || isLoading}
                    className={`m-4 px-4 py-2 rounded text-white
                        ${isChecked && !isLoading ? 'bg-[#33658a] hover:bg-[#33658a]' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                    {isLoading ? 'Uploading & Parsing...' : 'Upload'}
                </button>
            </div>
            <Footer />
        </div>
    );
}

export default ParseCAS;
