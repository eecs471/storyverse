import { db, auth } from "../config/firebase"
import {  createUserWithEmailAndPassword } from 'firebase/auth';
import { getDocs, collection, addDoc, getDoc, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

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

            <input
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                placeholder="Password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
            />

            <input
                placeholder="Name"
                onChange={(e) => setName(e.target.value)}
            />

            <input
                placeholder="Age"
                type="number"
                onChange={(e) => setAge(Number(e.target.value))}
            />

            <div className="interest">
                <input
                    placeholder="Interest"
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                />
                <button onClick={() => {setInterests([...interests, interest]); setInterest("")}}> Add </button>
            </div>

            {interests.length > 0 ? <strong>Interests:</strong> : <strong>No Interests Added</strong>}

            {interests.map((interest) => (
                <p>{interest} <button onClick={() => removeInterest(interest)}> Remove </button></p>
            ))}

            <button onClick={signUp}> Sign Up </button>
        </div>
    )
}