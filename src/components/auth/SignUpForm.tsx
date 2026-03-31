/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import logo from "../../assets/logo.jpg";
import { API } from "../../api/api";

export default function SignUpForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const payload = {
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      Password: password,
    };

    const getPasswordError = (password: string) => {
      if (password.length < 8 || password.length > 10) {
        return "Password must be 8 to 10 characters long";
      }
      // if (!/[A-Z]/.test(password)) {
      //   return "Password must contain at least one uppercase letter";
      // }
      // if (!/[a-z]/.test(password)) {
      //   return "Password must contain at least one lowercase letter";
      // }
      // if (!/\d/.test(password)) {
      //   return "Password must contain at least one number";
      // }
      // if (!/[@$!%*?&]/.test(password)) {
      //   return "Password must contain at least one special character (@$!%*?&)";
      // }
      return "";
    };
    const error = getPasswordError(password);

    if (error) {
      toast.error(error);
      return;
    }

    try {
      await axios.post(
        API.SIGN_UP,
        payload
      );

      toast.success("Registration successful");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      navigate("/signin");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full lg:w-1/2">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="w-32" />
        </div>

        <h1 className="mb-2 text-xl font-semibold">Sign Up</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div>
              <Label>Last Name</Label>
              <Input
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  const val = e.target.value;
                  setPassword(val);
                }}
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 cursor-pointer">
                {showPassword ? <EyeIcon /> : <EyeCloseIcon />}
              </span>
            </div>
          </div>

          <button className="w-full bg-[#83261D] text-white py-3 rounded-lg">
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/signin" className="text-[#83261D]">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
