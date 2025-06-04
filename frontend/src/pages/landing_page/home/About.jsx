import React from "react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

function About() {
    return (
        <div className="about-1">
            <div className="text">
                <h1>ABOUT US</h1>
            </div>
            <div className="about">
                <div>
                    <img src='media/images/about.png' alt="image"></img>
                </div>
                <div>
                    <h2>Passionate for your Financial</h2>
                    <h2>Support Here</h2>
                    <br></br>
                    <div>
                        <div className="data" >
                            <IoMdCheckmarkCircleOutline size={40} />
                            <p>Pay Bills On Time Without Missing A Beat</p>
                        </div>
                        <div className="data" >
                            <IoMdCheckmarkCircleOutline size={40} />
                            <p>Pay Bills On Time Without Missing A Beat</p>
                        </div>
                        <div className="data" >
                            <IoMdCheckmarkCircleOutline size={40} />
                            <p>Pay Bills On Time Without Missing A Beat</p>
                        </div>
                        <div className="data" >
                            <IoMdCheckmarkCircleOutline size={40} />
                            <p>Pay Bills On Time Without Missing A Beat</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default About;