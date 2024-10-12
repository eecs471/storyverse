import { auth } from "../config/firebase"
import {  signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from "react"
import { Signup } from "./Signup"
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
    const navigate = useNavigate();

    return (
        <div className="profile">
            Under Development      
            <button onClick={() => navigate("/")}> Go Back to Homepage </button>
        </div>
    )
}