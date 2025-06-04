import React from "react";
import Navbar from "./Navbar.jsx";
import Image from "./Image.jsx";
import Footer from ".//Footer.jsx";
import About from "./About.jsx";

function Homepage() {
    return (
        <>
            <div>
                <Navbar />
            </div>
            <div>
                {/* <Image /> */}
            </div>
            <div>

                <About />
            </div>
            <div>
                <Footer />
            </div>

        </>
    );
}

export default Homepage;