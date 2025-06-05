import React from "react";
import Navbar from "../../components/Navbar.jsx";
import Image from "../../components/Image.jsx";
import Footer from "../../components/Footer.jsx";
import About from "../../components/About.jsx";
import Getintouch from "../../components/getintouch.jsx";

function Homepage() {
    return (
        <>
            <div className="parent">
                <Navbar />
                <Image />
                <About />
                <Getintouch/>
                <Footer />
            </div>

            {/* <Navbar />
            <About />
            <Footer /> */}
        </>
    );
}

export default Homepage;