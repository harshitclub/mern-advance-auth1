import React, { useEffect, useState } from "react";
import { BiLogIn } from "react-icons/bi";
import Card from "../../components/card/Card";
import PasswordInput from "../../components/passwordInput/PasswordInput";
import styles from "./auth.module.scss";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { validateEmail } from "../../redux/features/auth/authService";
import { useDispatch, useSelector } from "react-redux";
import { login, RESET } from "../../redux/features/auth/authSlice";
import Loader from "../../components/loader/Loader";

const initialState = {
  email: "",
  password: "",
};

const Login = () => {
  const [formData, setFormData] = useState(initialState);

  const { email, password } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, isLoggedIn, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const loginUser = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return toast.error("All fields are required");
    }

    if (!validateEmail(email)) {
      return toast.error("Please enter a valid email");
    }

    const userData = {
      email,
      password,
    };

    await dispatch(login(userData));
  };

  useEffect(() => {
    if (isSuccess && isLoggedIn) {
      navigate("/profile");
    }
    dispatch(RESET());
  }, [isLoggedIn, isSuccess, dispatch, navigate]);
  return (
    <>
      <div className={`container ${styles.auth}`}>
        {isLoading && <Loader />}
        <Card>
          <div className={styles.form}>
            <div className="--flex-center">
              <BiLogIn size={35} color="#999" />
            </div>
            <h2>Login</h2>
            <div className="--flex-center">
              <button className="--btn --btn-google">Login With Google</button>
              {/* <GoogleLogin
                onError={() => {
                  console.log("Login Failed");
                }}
              /> */}
            </div>
            <br />
            <p className="--text-center --fw-bold">or</p>

            <form onSubmit={loginUser}>
              <input
                type="email"
                placeholder="Email"
                required
                name="email"
                value={email}
                onChange={handleInputChange}
              />
              <PasswordInput
                placeholder="Password"
                name="password"
                value={password}
                onChange={handleInputChange}
              />

              <button type="submit" className="--btn --btn-primary --btn-block">
                Login
              </button>
            </form>
            <Link to="/forgot">Forgot Password</Link>
            <span className={styles.register}>
              <Link to="/">Home</Link>
              <p> &nbsp; Don't have an account? &nbsp;</p>
              <Link to="/register">Register</Link>
            </span>
          </div>
        </Card>
      </div>
    </>
  );
};

export default Login;