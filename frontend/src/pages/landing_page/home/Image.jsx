import React from "react";

function Image() {
    return (

        <div className="row img" >
            <img src='media/images/img.png' alt="image"></img>
            <div className="overlay">
                <h1><span className="first"> MONEY</span><span className="second">ANTRA</span></h1>
                <p>Earn More To Spend More</p>
            </div>

        </div>

    );
}

export default Image;
