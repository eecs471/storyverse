import { auth } from "../config/firebase"
import {  signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from "react"
import { Signup } from "./Signup"
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '@chakra-ui/react'

export const Login = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const signIn = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/");
        }
        catch(err) {
            console.error(err);
        }
    };

    return (
        <div className="login" style={{display: 'flex', flexDirection: 'column'}}>
            <strong style={{fontSize: 20}}> Login </strong>
            <Input
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
            />
            <Input
                placeholder="Password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
            />
            <Button onClick={signIn}> Sign In </Button>

            <strong>Don't have an account? <Button onClick={() => navigate("../signup")}> Sign Up </Button></strong>
        </div>
    )
}