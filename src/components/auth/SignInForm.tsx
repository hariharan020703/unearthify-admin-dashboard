/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
// import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import logo from "../../assets/logo.jpg";
import { API } from "../../api/api";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  // const [isChecked, setIsChecked] = useState(false);

  const [value, setValue] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    if (!value.email.includes("@")) {
      toast.error("Enter valid email");
      return false;
    }
    if (value.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const res = await axios.post(
        API.SIGN_IN,
        {
          Email: value.email,
          Password: value.password,
        }
      );

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Login successful");
      navigate("/");
    } catch (error: any) {
      toast.error("Enter Registered mail", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const token =
      localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, []);

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="w-28 object-contain" />
        </div>

        <h1 className="mb-2 font-semibold text-gray-800 text-xl text-center">
          Sign In
        </h1>

        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your email and password to continue
        </p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <Label>Email</Label>
              <Input
                name="email"
                value={value.email}
                onChange={onChange}
                placeholder="info@gmail.com"
              />
            </div>

            <div>
              <Label>Password</Label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={value.password}
                  onChange={onChange}
                  placeholder="Enter your password"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2">
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 size-5" />
                  )}
                </span>
              </div>
            </div>

            {/* <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox checked={isChecked} onChange={setIsChecked} />
                <span className="text-sm text-gray-700">Keep me logged in</span>
              </div>

              <Link to="/reset-password" className="text-sm text-[#83261D]">
                Forgot password?
              </Link>
            </div> */}

            <Button className="w-full" size="sm" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </form>

        <p className="text-sm text-center text-gray-700 mt-6">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-[#83261D]">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
