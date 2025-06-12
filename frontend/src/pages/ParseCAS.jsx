import React, { useState } from 'react'
import cas1 from '../components/images/CAS1.png'
import cas2 from '../components/images/CAS2.png'
import { IoCloudUploadOutline } from "react-icons/io5";
import { TbLockPassword } from "react-icons/tb";
import Footer from '../components/Footer';

function ParseCAS() {

    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('');
    const [password, setPassword] = useState('');
    const [isChecked, setIsChecked] = useState(false);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.type === "application/pdf") {
            setFile(selected);
            setStatus(`Selected: ${selected.name}`);
        } else {
            setFile(null);
            setStatus('❌ Please upload a valid PDF');
        }
    };

    const handleUpload = async () => {
        if (!file) return alert('Please select a file first.');
        if(!password) return alert('Please Enter Password.')
        if ( file) return alert("File Uploaded Successfully.") 

        const formData = new FormData();
        formData.append('file', file);

        // try {
        //     const res = await fetch('http://localhost:5000/upload', {
        //         method: 'POST',
        //         body: formData,
        //     });

        //     const data = await res.json();
        //     if (res.ok) {
        //         setStatus(`✅ Uploaded: ${data.originalname}`);
        //     } else {
        //         setStatus(`❌ ${data.message}`);
        //     }
        // } catch (err) {
        //     console.error(err);
        //     setStatus('❌ Upload failed');
        // }
  };

  return (
    <div>
        <div className='text-[#6f779d] text-4xl open-sans-moneyantra text-center'>Upload CAS</div>
        <div className='text-[#00b3be] text-2xl mt-3 text-center lg:text-4xl underline'>Instructions to download CAS</div>
        <div className='text-black font-semibold px-4'>
            <ul className='list-disc space-y-2 mt-4 lg:text-3xl'>
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
        <div className='w-full px-4 flex flex-col'>
            <label className="cursor-pointer">
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <div className="border-dashed border-[#38b6ff] border-2 rounded-xl flex items-center justify-center flex-col py-4 hover:bg-blue-50 transition">
                    <IoCloudUploadOutline size={40} className="text-[#33658a]" />
                    <p className="text-[#33658a] font-medium mt-2 text-2xl">Upload PDF</p>
                </div>
            </label>

            {status && <p className="mt-4 text-sm text-gray-700">{status}</p>}
            <br />
            <div className='text-3xl flex flex-row items-center justify-center'>
                <TbLockPassword size={30}/>
                <div>Password</div>
            </div>
            <div className='cursor-pointer flex flex-row items-center justify-center gap-4'>
                
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className='border-2 border-amber-500 w-3/4 rounded-lg px-2 h-[40px] text-center'
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

            <button onClick={handleUpload} disabled={!isChecked} className={`mt-4 px-4 py-2 rounded text-white 
              ${isChecked ? 'bg-[#38b6ff] hover:bg-[#2ea4e0]' : 'bg-gray-400 cursor-not-allowed'}`}>Upload</button>
        </div>
        <br />
        <br />
        <Footer />
    </div>
  )
}

export default ParseCAS