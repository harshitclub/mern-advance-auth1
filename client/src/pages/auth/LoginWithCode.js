import React from "react";
import styles from "./auth.module.scss";
import Card from "../../components/card/Card";
import { GrInsecure } from "react-icons/gr";
import { Link } from "react-router-dom";

const LoginWithCode = () => {
  return (
    <>
      <div className={`container ${styles.auth}`}>
        {/* {isLoading && <Loader />} */}
        <Card>
          <div className={styles.form}>
            <div className="--flex-center">
              <GrInsecure size={35} color="#999" />
            </div>
            <h2>Enter Access Code</h2>

            <form>
              <input
                type="text"
                placeholder="Access Code"
                required
                name="loginCode"
                // value={loginCode}
                // onChange={(e) => setLoginCode(e.target.value)}
              />

              <button type="submit" className="--btn --btn-primary --btn-block">
                Proceed To Login
              </button>
              <span className="--flex-center">
                Check your email for login access code
              </span>
              <div className={styles.links}>
                <p>
                  <Link to="/">- Home</Link>
                </p>
                <p
                  //   onClick={sendUserLoginCode}
                  className="v-link --color-primary"
                >
                  <b>Resend Code</b>
                </p>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </>
  );
};

export default LoginWithCode;
