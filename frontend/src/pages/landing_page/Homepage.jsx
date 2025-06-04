import React from "react";
import Navbar from "../../components/Navbar.jsx";
import Image from "../../components/Image.jsx";
import Footer from "../../components/Footer.jsx";
import About from "../../components/About.jsx";

function Homepage() {
    return (
        <>
        <Navbar />
        <Image />
        <About />
        <Footer />
            {/* <Navbar />
            <About />
            <Footer /> */}
        </>
    );
}

export default Homepage;