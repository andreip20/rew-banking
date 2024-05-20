"use client";

import React, { useState } from "react";
import Image from "next/image";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import signup from "../../public/undraw_sign_up_n6im.svg";
import logo from "../../public/Rew-logos_transparent.png";
import Link from "next/link";

const RegistrationForm = () => {
  const inputFields = [
    {
      name: "username",
      type: "text",
      placeholder: "Username",
      label: "Username",
    },
    { name: "email", type: "email", placeholder: "Email", label: "Email" },
    {
      name: "firstName",
      type: "text",
      placeholder: "First Name",
      label: "First Name",
    },
    {
      name: "lastName",
      type: "text",
      placeholder: "Last Name",
      label: "Last Name",
    },
    {
      name: "phoneNumber",
      type: "tel",
      placeholder: "Phone Number",
      label: "Phone Number",
    },
    {
      name: "address",
      type: "text",
      placeholder: "Address (Optional)",
      label: "Address (Optional)",
      isOptional: true,
    },
    {
      name: "password",
      type: "password",
      placeholder: "Password",
      label: "Password",
    },
    {
      name: "repeatPassword",
      type: "password",
      placeholder: "Repeat Password",
      label: "Repeat Password",
    },
  ];
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    password: "",
    repeatPassword: "",
  });
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const validateInput = (name, value) => {
    switch (name) {
      case "username":
      case "firstName":
      case "lastName":
        if (/[^a-zA-Z]/.test(value)) {
          return "This field should not contain numbers or special characters.";
        }
        break;
      case "phoneNumber":
        if (/[^0-9]/.test(value)) {
          return "Phone number should only contain digits.";
        }
        break;
      case "password":
        if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}/.test(value)) {
          return "Password must be at least 8 characters long, include an uppercase letter, a number, and a special character.";
        }
        break;
      case "email":
        if (!/^\S+@\S+\.\S+$/.test(value)) {
          return "Invalid email format.";
        }
        break;
    }
    return "";
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    const error = validateInput(name, value);
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: error });
  };

  const sendUserData = async (event) => {
    try {
      const response = await axios.post("/api/register", {
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 200) {
        toast.success("Registration approved, please verify your email.");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (error) {
      toast.error(
        error.response.data.error || "Registration failed. Please try again."
      );
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    let valid = true;
    let newErrors = {};

    Object.keys(formData).forEach((key) => {
      const error = validateInput(key, formData[key]);
      if (error) {
        valid = false;
        newErrors[key] = error;
      }
    });

    if (formData.password !== formData.repeatPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!valid) {
      setErrors(newErrors);
      return;
    }

    sendUserData(formData);
  };

  return (
    <div className="w-[80%] p-8 bg-white h-[90%] rounded-lg shadow-2xl">
      <Toaster></Toaster>
      <div className="w-full flex items-center justify-center text-center">
        <Image src={logo} alt="logo" width={100} height={100} />
        <h1 className="text-3xl flex-1 text-blue-500 text-center">Sign Up</h1>
      </div>
      <div className="w-full h-auto flex justify-between gap-5 ml-8 items-center mt-16">
        <Image src={signup} alt="signup-pic" width={400} height={400} />
        <form
          className="w-full h-full grid grid-cols-2 gap-5"
          onSubmit={handleSubmit}
        >
          {inputFields.map(({ name, type, placeholder, label, isOptional }) => (
            <div
              className="flex flex-col items-center justify-center"
              key={name}
            >
              <label htmlFor={`${name}-register`} className="block">
                {label}
              </label>
              <input
                type={type}
                name={name}
                placeholder={placeholder}
                id={`${name}-register`}
                required={!isOptional}
                className="w-[70%] border-2 border-blue-500 p-2 rounded-lg text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData[name]}
                onChange={handleChange}
              />
              {errors[name] && <p className="text-red-500">{errors[name]}</p>}
            </div>
          ))}
          <div className="col-span-2 flex justify-center">
            <button
              type="submit"
              className="w-32 p-2 border mt-4 border-blue-500 rounded-lg bg-blue-500 text-white hover:bg-white hover:text-blue-500 transition duration-200 ease-in focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Register
            </button>
          </div>
          <div className="col-span-2 flex justify-center">
            <Link className="text-blue-500" href="/login">
              Have an existing account?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
