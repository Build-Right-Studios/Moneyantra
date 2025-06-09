import React from "react";
import img1 from './images/img.png';

function Image() {
    return (
        <div className="w-screen h-screen relative img-container">
            <img src={img1} alt="background" className="w-full h-[100%] object-cover img" />
            <div className="absolute top-30 left-30 overlay">
                <h1 className="first">MONEY<span className="second">ANTRA</span></h1>
                <p>Earn More To Spend More</p>
            </div>        
        </div>
    );
}

export default Image;


