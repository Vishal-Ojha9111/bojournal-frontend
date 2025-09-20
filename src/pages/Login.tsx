import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import serverUrl from "../var/serverUrl";

const Login: React.FC = () => {
    const { setUser, csrfToken } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if(!email || !password){
            toast.error('All fields are mandatory.')
            return
        }
        const data = await fetch(`${serverUrl}/api/auth/login`,{
            method: 'POST',
            credentials: 'include',
            headers: {"Content-Type":"application/json", 'x-CSRFToken': csrfToken || ''},
            body:JSON.stringify({email,password})
        })
        const res = await data.json();
        if (res.status){
            setUser(res.user)
            localStorage.setItem('boj-user', JSON.stringify(res.user))
            toast.success(res.message)
            if(!res.user.verified){
                toast.error('Please contact developer to verify your account.')
            }
        }
        else {
            toast.error(res.message)
        }
    };

    return (
        <div className="py-28 bg-gray-100 flex flex-col justify-center">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    <div className="max-w-md mx-auto">
                        <div className="divide-y divide-gray-200">
                            <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">Login</h1>
                                <form onSubmit={handleFormSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <input
                                            type="email"
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="password"
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        <button
                                            type="submit"
                                            className="w-full px-4 py-2 text-white font-semibold bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                                        >
                                            Login
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/signup')}
                                            className="w-full px-4 py-2 text-blue-500 font-semibold bg-transparent border border-blue-500 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                                        >
                                            Create new account
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/forgotpassword')}
                                            className="text-blue-500 hover:text-blue-600 font-medium text-sm"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;