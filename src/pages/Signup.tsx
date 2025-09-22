import React, {useState} from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/16/solid";
import serverUrl from "../var/serverUrl";

interface UserSignup {
 first_name : string,
 last_name : string,
 email : string,
 password : string,
 confirm_password : string
 referral_code: string|null
}


const Signup : React.FC  =  () => {

    const {setUser, csrfToken} = useAuth()

    const navigate = useNavigate()

    const [signupUser, setSignupUser] = useState<UserSignup>({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: "",
        referral_code: null
    })

    const [otp,setOtp] = useState<number>()

    const [isOtpSent,setIsOtpSent] = useState<boolean>(false)

    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if(!signupUser.first_name || !signupUser.last_name || !signupUser.email || !signupUser.password || !signupUser.confirm_password){
            toast.error('All fields are required')
            return;
        }
        if(signupUser.confirm_password!=signupUser.password){
            toast.error('Passwords do not match')
            return;
        }
        const res = await fetch(`${serverUrl}/api/auth/signup`, {
            method: 'POST',
            credentials : 'include',
            headers: {
                'Content-Type': 'application/json',
                'x-CSRFToken': csrfToken || ''
            },
            body: JSON.stringify(signupUser)
        });
        const data = await res.json();
        if(data.status){
            setIsOtpSent(true)
            toast.success(data.message)
            return
        }
        toast.error(data.message)
    }

    const handleSubmitOtp = async (event:React.FormEvent<HTMLFormElement>) =>{
        event.preventDefault()
        try{
        const res = await fetch(`${serverUrl}/api/auth/verifyotp`,{
            method:'POST',
            credentials:'include',
            headers:{'content-type':'application/json', 'x-CSRFToken': csrfToken || ''},
            body:JSON.stringify({email:signupUser.email,otp})
        })
        if (res.status>=500){
            throw new Error('Server error please try again later')
        }
        const data = await res.json();
        if (!data.status){
            throw new Error(data.message)
        }
        setUser(data.user)
        toast.success(data.message)
        if(!data.user.verified){
            toast.error("Please contact developer to verify your account.")
            return
        }
    }catch (error: unknown){
        toast.error(error instanceof Error ? error.message : 'An unexpected error occurred')
    }
    }


    return (
        <div className="py-28 bg-gray-100 flex flex-col justify-center sm:py-0">
            <div className="relative sm:max-w-xl sm:mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    <div className="max-w-md mx-auto">
                        <div className="divide-y divide-gray-200">
                            <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">Sign Up</h1>
                                <form onSubmit={handleFormSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            disabled={isOtpSent}
                                            value={signupUser.first_name}
                                            onChange={(e) => setSignupUser({ ...signupUser, first_name: e.target.value })}
                                            placeholder="First Name"
                                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                        />
                                        <input
                                            type="text"
                                            disabled={isOtpSent}
                                            value={signupUser.last_name}
                                            onChange={(e) => setSignupUser({ ...signupUser, last_name: e.target.value })}
                                            placeholder="Last Name"
                                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                        />
                                        <input
                                            type="email"
                                            disabled={isOtpSent}
                                            value={signupUser.email}
                                            onChange={(e) => setSignupUser({ ...signupUser, email: e.target.value })}
                                            placeholder="Email"
                                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                        />
                                        <input
                                            type="password"
                                            disabled={isOtpSent}
                                            value={signupUser.password}
                                            onChange={(e) => setSignupUser({ ...signupUser, password: e.target.value })}
                                            placeholder="Password"
                                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                        />
                                        <input
                                            type="password"
                                            disabled={isOtpSent}
                                            value={signupUser.confirm_password}
                                            onChange={(e) => setSignupUser({ ...signupUser, confirm_password: e.target.value })}
                                            placeholder="Confirm Password"
                                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                        />
                                        <input
                                            type="text"
                                            disabled={isOtpSent}
                                            value={signupUser.referral_code ?? ''}
                                            onChange={(e) => setSignupUser({ ...signupUser, referral_code: e.target.value })}
                                            placeholder="Referral Code (Optional)"
                                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                        />
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        <button
                                            disabled={isOtpSent}
                                            type="submit"
                                            className="w-full px-4 py-2 text-white font-semibold bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                                        >
                                            Sign Up
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/login')}
                                            className="w-full px-4 py-2 text-blue-500 font-semibold bg-transparent border border-blue-500 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                                        >
                                            Already have an account? Login
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isOtpSent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-8 relative rounded-lg shadow-xl max-w-md w-full mx-4">
                    <XMarkIcon className="h-6 w-6 absolute bg-red-400 text-black font-bold rounded-md top-2 right-2 cursor-pointer" onClick={() => setIsOtpSent(false)} />
                        <form onSubmit={handleSubmitOtp} className="space-y-4">
                            <p className="text-gray-700 text-center font-medium">OTP has been sent to your email</p>
                            <input
                                type="number"
                                onChange={(e) => setOtp(Number(e.target.value))}
                                placeholder="Enter OTP"
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                className="w-full px-4 py-2 text-white font-semibold bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                            >
                                Verify OTP
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Signup;