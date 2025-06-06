import React from "react";
import img1 from './images/img.png';

function Image() {
    return (
        <div className="w-screen h-screen relative img-container">
            <img src={img1} alt="background" className="w-full h-[100%] object-cover img" />
            <div className="absolute top-30 left-30 overlay">
                <h1>
                    <span className="text-[#33658A]">MONEY</span>
                    <span className="text-[#F26419]">ANTRA</span>
               </h1>
               <p className="font-bold text-center">Earn More To Spend More </p>
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