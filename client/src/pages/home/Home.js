import React from "react";
import "./Home.scss";
import { Link } from "react-router-dom";

import loginImg from "../../assets/login.svg";

const Home = () => {
  return (
    <>
      <section className="container hero">
        <div className="hero-text">
          <h2>Ultimate MERN Stack Authentication System</h2>
          <p>
            MERN Stack Authentication and Authorization Secure Web Application
          </p>
          <p>
            We Can Signup & Signin in this MERN Stack Authentication &
            Authorization Web Application By Social Login, Google Login, Email
            Login, Etc.
          </p>
          <div className="hero-buttons --flex-start">
            <button className="--btn --btn-danger">
              <Link to="/register">Register</Link>
            </button>
            <button className="--btn --btn-primary">
              <Link to="/login">Login</Link>
            </button>
          </div>
        </div>
        <div className="hero-image">
          <img src={loginImg} alt="Auth" />
        </div>
      </section>
    </>
  );
};

export default Home;
