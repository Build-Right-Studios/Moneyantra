import Navbar from "../../components/Navbar.jsx";
import PortfolioSection from "../../components/Homepage/PortfolioSection.jsx";
import Footer from "../../components/Footer.jsx";
import About from "../../components/About.jsx";
import Getintouch from "../../components/getintouch.jsx";
import Tax from "../../components/Homepage/Tax.jsx";
import StatsSection from "../../components/Homepage/StatsSection.jsx";
import Reviews from "../../components/Homepage/Reviews.jsx";


function Homepage() {
    return (
        <>
            <div className="parent">
                <Navbar />

                <PortfolioSection />

                <StatsSection />
                <Tax />
                <Reviews />
                <About />
                <Getintouch />
                <Footer />

            </div>
        </>
    );
}

export default Homepage;