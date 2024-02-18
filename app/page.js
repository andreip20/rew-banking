import Image from "next/image";
import logo from "@/public/Rew-logos_transparent.png";
import "./styles/login.css";
import login_svg from "@/public/undraw_login_re_4vu2.svg";

export default function Home() {
  console.log(process.env);

  return (
    <>
      <div className="login-container">
        <div className="login-header">
          <Image src={logo} alt="logo" width={120} height={120}></Image>
          <h1>Log In</h1>
        </div>

        <div className="login-form">
          <Image
            src={login_svg}
            alt="login_svg"
            width={400}
            height={400}
          ></Image>

          <form>
            <div className="for-login-form">
              <label for="username-login">Username</label>
              <input
                type="text"
                id="username-login"
                placeholder="Username"
              ></input>
            </div>

            <div className="for-login-form">
              <label for="password-login">Password</label>
              <input
                type="password"
                id="password-login"
                placeholder="Password"
              ></input>
            </div>

            <input
              className="login-btn"
              type="submit"
              placeholder="Log In"
            ></input>
          </form>
        </div>
      </div>
    </>
  );
}
