import Navbar from "../../components/Navbar.jsx";
import Image from "../../components/Image.jsx";
import Footer from "../../components/Footer.jsx";
import About from "../../components/About.jsx";
import Getintouch from "../../components/getintouch.jsx";
import Tax from "../../components/Homepage/Tax.jsx";


function Homepage() {
    return (
        <>
            <div className="parent">
                <Navbar />
                <Image />
                <Tax/>
                <About />
                <Getintouch/>
                <Footer />
                
            </div>
        </>
    );
}

export default Homepage;