import React from "react";
import img1 from '../images/img.png';

function Image() {
    return (
        <div className="w-screen h-screen relative">
            <img src={img1} alt="background" className="w-full h-[95%] object-cover" />
            <div className="absolute top-0 left-10">
                <h1 className="text-[#33658A]">MONEY<span className="text-[#F26419]">ANTRA</span></h1>
                <p>Earn More To Spend More</p>
            </div>        
        </div>
    );
}

export default Image;


 // <div className="row img" >
        //     <img src='media/images/img.png' alt="image"></img>
        //     <div className="overlay">
        //         <h1><span className="first"> MONEY</span><span className="second">ANTRA</span></h1>
        //         <p>Earn More To Spend More</p>
        //     </div>

        // </div>