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
            borderColor="gray.500"
                  borderRadius="md"
                  focusBorderColor="blue.500"
                placeholder="Email"
                marginBottom="10px"
                onChange={(e) => setEmail(e.target.value)}
            />
            <Input
            borderColor="gray.500"
                  borderRadius="md"
                  focusBorderColor="blue.500"
                  marginBottom="10px"
                placeholder="Password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
            />
            <Button onClick={signIn} marginBottom="10px"> Sign In </Button>

            <strong>Don't have an account? <Button onClick={() => navigate("../signup")}> Sign Up </Button></strong>
        </div>
    )
}