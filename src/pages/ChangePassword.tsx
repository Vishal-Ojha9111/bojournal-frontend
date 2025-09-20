import React, {useState} from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import serverUrl from '../var/serverUrl';

 const ChangePassword : React.FC=()=>{
    const [changePassword, setChangePassword] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [otp, setOtp] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [otpVerified, setOtpVerified] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const { user, csrfToken } = useAuth();
    const navigate = useNavigate();

    const handleChangePassword = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${serverUrl}/api/auth/resetpassword`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'x-CSRFToken': csrfToken || '',
                },
                body: JSON.stringify({ email: user ? user?.email : email }),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to initiate password change.");
            }
            const data = await res.json();
            toast.success(data.message || "Otp sent to your email successfully.");
            setChangePassword(true);
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Failed to initiate password change.");
        }finally{
            setLoading(false);
        }
    }

    const handleUpdatePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        try {
            setLoading(true);
            const res = await fetch(`${serverUrl}/api/auth/updatepassword`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'x-CSRFToken': csrfToken || '',
                },
                body: JSON.stringify({ password: newPassword }),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to update password.");
            }
            const data = await res.json();
            toast.success(data.message || "Password updated successfully.");
            setSuccess(true);
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Failed to update password.");
        }finally{
            setLoading(false);
        }
    }

    const handleVerifyOtp = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${serverUrl}/api/auth/verifyotp`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'x-CSRFToken': csrfToken || '',
                },
                body: JSON.stringify({ email: user?.email ? user.email : email, otp }),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to verify OTP.");
            }
            const data = await res.json();
            toast.success(data.message || "OTP verified successfully.");
            setOtpVerified(true);
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Failed to verify OTP.");
        }finally{
            setLoading(false);
        }
    }

    return <>
    {!user && (
    <div> 
        <h1>Enter your Registered Email to Change password</h1>
        <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={changePassword||loading}/>
    </div>
    )}
    <button onClick={handleChangePassword} disabled={changePassword}>{!changePassword && loading?"Loading...":user?"Change Password":"Get Otp"}</button>
    {changePassword && 
    <div>
    <input type="number" placeholder="Enter otp" value={otp} disabled={otpVerified} onChange={(e) => setOtp(e.target.value)} />
    <button onClick={handleVerifyOtp} disabled={otpVerified}>{!otpVerified && loading?"Loading...":"Verify Otp"}</button>
    </div>
    }
    {otpVerified && 
    <div>
    <input type="password" placeholder="Enter new password" disabled={success} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
    <input type="password" placeholder="Confirm new password" disabled={success} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
    <button onClick={handleUpdatePassword} disabled={success}>Submit</button>
    </div>}
    {!user && (
    <div> 
     <button onClick={() => navigate('/login')}>Login</button>
     <button onClick={() => navigate('/signup')}>Signup</button>   
    </div>
    )}
    </>
    }

export default ChangePassword