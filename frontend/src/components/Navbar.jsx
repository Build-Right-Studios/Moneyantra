import React from "react";
import { NavLink } from "react-router-dom";

function Navbar() {
    return (
        <div className="nav">
            <div className="name">
                <img className="image" src='media/images/moneyantra.ico' alt="image"></img>
                <h5>
                    <span className="first">MONEY</span>
                    <span className="second">ANTRA</span>
                </h5>
            </div>

            <div className="links">
                <NavLink to="/login">
                    <span>LOGIN</span>
                </NavLink>
            </div>
        </div>
    );
}

export default Navbar;