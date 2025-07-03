import Navbar from "../../components/Navbar.jsx";
import PortfolioSection from "../../components/Homepage/PortfolioSection.jsx";
import Footer from "../../components/Footer.jsx";
import Getintouch from "../../components/getintouch.jsx";
import Tax from "../../components/Homepage/Tax.jsx";
import StatsSection from "../../components/Homepage/StatsSection.jsx";
import Reviews from "../../components/Homepage/Reviews.jsx";
import Optimizer from "../../components/Homepage/Optimizer.jsx";


function Homepage() {
    return (
        <>
            <div>
                <Navbar />
                <div className="bg-white">
                    <PortfolioSection />
                    <StatsSection />
                    <Tax />
                </div>
                <Reviews />
                <Optimizer />
                <Getintouch />
                <Footer />

            </div>
        </>
    );
}

export default Homepage;