import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import cas1 from "../components/images/CAS1.png";
import cas2 from "../components/images/CAS2.png";
import { IoCloudUploadOutline } from "react-icons/io5";
import { TbLockPassword } from "react-icons/tb";
import Footer from "../components/Footer";
import axiosInstance from "../utils/axiosInstance";
import NavbarLogin from "../components/Navbarlogin";

function ParseCAS() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      setStatus(`Selected: ${selected.name}`);
    } else {
      setFile(null);
      setStatus("Please upload a valid PDF");
    }
  };

  const handleUpload = async () => {
    if (!file || !password || !isChecked) {
      alert("Please ensure file, password, and disclaimer are set.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("password", password);

    try {
      const res = await axiosInstance.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 201) {
        console.log("Upload success:", res.data.message);
        localStorage.setItem("casData", JSON.stringify(res.data.casData));
        navigate("/display-cas");
      } else {
        setStatus(`Upload failed: ${res.data.message || "Unknown error"}`);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || "An unexpected error occurred.";
      alert(`Upload failed: ${msg}`);
      console.error("Upload error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };


  return (
    <div className="item-center justify-center">
      <NavbarLogin />
      <div className="text-[#6f779d] text-4xl mt-4 open-sans-moneyantra text-center">
        Upload CAS
      </div>


      <div
        onClick={toggleInstructions}
        className="cursor-pointer text-[#00b3be] text-2xl m-4 text-center lg:text-2xl underline"
      >
        Instructions to download CAS
      </div>

      {showInstructions && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto md:p-4"
          onClick={toggleInstructions}
        >
          <div
            className="bg-white p-4 max-md:p-0 rounded-lg w-11/12 md:w-2/3 relative"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              onClick={toggleInstructions}
              className="absolute top-20 right-10 text-9xl text-gray-700 hover:text-black"
            >
              X
            </button>
            <div className="p-4 m-4 max-sm:p-0 max-sm:m-0 ">
              <h2 className="text-[#33658a] text-2xl mb-4 text-center font-semibold">
                How to Download Your CAS
              </h2>
              <ul className="list-disc space-y-2 px-4 text-black text-base md:text-lg">
                <li>
                  Go to{" "}
                  <a
                    href="https://www.camsonline.com/Investors/Statements/Consolidated-Account-Statement"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    CAMS
                  </a>
                </li>
                <li>Select Statement Type – Detailed</li>
                <li>Select Period – Start date to current date</li>
                <li>
                  Select Folio Listing as – Transacted folios and folios with
                  Balances
                </li>
                <li>Enter your email and password</li>
                <li>
                  You will receive CAS over email in PDF format. Upload it below.
                </li>
              </ul>
              <div className="w-full px-4">
                <img src={cas1} alt="CAS sample 1" />
              </div>
              <div className="w-full px-4">
                <img src={cas2} alt="CAS sample 2" />
              </div>
            </div>


          </div>
        </div>
      )}



      <div className="mx-auto justify-center md:w-[80%] px-4 flex flex-col mt-8">
        <label className="cursor-pointer shadow-2xl mb-4 rounded-2xl">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="md:h-[250px] border-dashed border-[#38b6ff] border-2 rounded-xl flex flex-col items-center justify-center py-4 hover:bg-blue-50 transition">
            <IoCloudUploadOutline size={40} className="text-[#33658a]" />
            <p className="text-[#33658a] font-medium mt-2 text-2xl">
              Upload PDF
            </p>
          </div>
        </label>

        {status && <p className="mt-4 text-sm text-gray-700">{status}</p>}

        <div className="text-3xl flex flex-row items-center justify-center mt-6 gap-2">
          <TbLockPassword size={30} />
          <span>Password</span>
        </div>
        <div className="flex flex-row items-center justify-center gap-4 mt-2">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-2 border-[#f26419] w-2/4 rounded-lg px-2 h-[40px] text-center"
          />
        </div>

        <div className="flex flex-col lg:flex-row lg:gap-5 mt-6">
          <input
            type="checkbox"
            className="border border-black h-7 w-7"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
          />
          <p>
            Disclaimer: By uploading your CAS, you allow it to be stored
            temporarily on our servers for parsing and analysis. This data will
            not be shared or reused. Please accept to proceed.
          </p>
        </div>

        <button
          onClick={handleUpload}
          disabled={!isChecked || isLoading}
          className={`m-4 px-4 py-2 rounded text-white ${isChecked && !isLoading
            ? "bg-[#33658a] hover:bg-[#33658a]"
            : "bg-gray-400 cursor-not-allowed"
            }`}
        >
          {isLoading ? "Uploading & Parsing..." : "Upload"}
        </button>
      </div>

      <Footer />
    </div>
  );
}

export default ParseCAS;
