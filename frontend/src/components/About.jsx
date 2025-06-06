import React from "react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

function About() {
    return (
        <div className="about-1">
            <div className="text">
                <h1>ABOUT US</h1>
            </div>
            <div className="about">
                <div className='flex-item-left'>
                    <img src='media/images/about.png' alt="image" className='about_img'></img>
                </div>
                <div className='flex-item-right'>
                    <div>
                        <h2>Passionate for your Financial</h2>
                        <h2>Support Here</h2>
                        <br></br>
                        <div className="gap">
                            <div className="data" >
                                <IoMdCheckmarkCircleOutline size={40} />
                                <span>Pay Bills On Time Without Missing A Beat</span>
                            </div><br></br>
                            <div className="data" >
                                <IoMdCheckmarkCircleOutline size={40} />
                                <span>Pay Bills On Time Without Missing A Beat</span>
                            </div><br></br>
                            <div className="data" >
                                <IoMdCheckmarkCircleOutline size={40} />
                                <span>Pay Bills On Time Without Missing A Beat</span>
                            </div><br></br>
                            <div className="data" >
                                <IoMdCheckmarkCircleOutline size={40} />
                                <span>Pay Bills On Time Without Missing A Beat</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default About;