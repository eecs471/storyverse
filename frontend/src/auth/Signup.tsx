import { db, auth } from "../config/firebase"
import {  createUserWithEmailAndPassword } from 'firebase/auth';
import { getDocs, collection, addDoc, getDoc, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Button, Input } from '@chakra-ui/react'

import { useState } from "react"
import { useNavigate } from 'react-router-dom';

export const Signup = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [age, setAge] = useState(-1);
    const [interest, setInterest] = useState("");
    const [interests, setInterests] = useState<string[]>([]);

    const signUp = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            const userDbRef = doc(db, "users", email);

            const newUser = {
                name: name,
                age: age,
                interests: interests,
            };

            await setDoc(userDbRef, newUser);
            navigate("../");
        }
        catch(err) {
            console.error(err);
        }
    }

    const removeInterest = (interestToRemove: string) => {
        setInterests((interest) => interests.filter(interest => interest !== interestToRemove));
    }

    return (
        <div className="signup" style={{display: 'flex', flexDirection: 'column'}}>
            <strong style={{fontSize: 20}}> Sign Up </strong>

            <Input
                placeholder="Email"
                borderColor="gray.500"
                  borderRadius="md"
                  focusBorderColor="blue.500"
                  marginBottom="10px"
                onChange={(e) => setEmail(e.target.value)}
            />

            <Input
                placeholder="Password"
                type="password"
                borderColor="gray.500"
                  borderRadius="md"
                  focusBorderColor="blue.500"
                  marginBottom="10px"
                onChange={(e) => setPassword(e.target.value)}
            />

            <Input
                placeholder="Name"
                borderColor="gray.500"
                  borderRadius="md"
                  focusBorderColor="blue.500"
                  marginBottom="10px"
                onChange={(e) => setName(e.target.value)}
            />

            <Input
                placeholder="Age"
                type="number"
                borderColor="gray.500"
                  borderRadius="md"
                  focusBorderColor="blue.500"
                  marginBottom="10px"
                onChange={(e) => setAge(Number(e.target.value))}
            />

            <div className="interest">
                <Input
                borderColor="gray.500"
                  borderRadius="md"
                  focusBorderColor="blue.500"
                  marginBottom="10px"
                    placeholder="Interest"
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                />
                <Button onClick={() => {setInterests([...interests, interest]); setInterest("")}} borderColor="gray.500"
                  borderRadius="md"
                  marginBottom="10px"> Add </Button>
            </div>

            {interests.length > 0 ? <strong>Interests:</strong> : <strong>No Interests Added</strong>}

            {interests.map((interest) => (
                <p>{interest} <Button onClick={() => removeInterest(interest)}> Remove </Button></p>
            ))}

            <Button onClick={signUp}> Sign Up </Button>
        </div>
    )
}