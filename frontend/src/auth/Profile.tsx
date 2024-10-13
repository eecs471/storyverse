import { db, auth } from "../config/firebase"
import {  deleteUser } from 'firebase/auth';
import { useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom';
import { getDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';

export const Profile = () => {
    const navigate = useNavigate();

    const [name, setName] = useState<string>("");
    const [newName, setNewName] = useState<string>("");

    const [age, setAge] = useState<number>(-1);
    const [newAge, setNewAge] = useState<number | "">("");

    const [interest, setInterest] = useState<string>("");
    const [interests, setInterests] = useState<string[]>([]);

    let userEmail = "";
    if (auth?.currentUser?.email) {
        userEmail = auth.currentUser.email;
    }
    const userDbRef = doc(db, "users", userEmail);
    
    useEffect(() => {
        const getUserData = async () => {
            try {
            const userData = await getDoc(userDbRef);
            const userFilteredData = {
                ...userData.data(), 
                email: userData.id,
            };
            
            setAge("age" in userFilteredData ? userFilteredData["age"] as number : -1);
            setName("name" in userFilteredData ? userFilteredData["name"] as string: "");
            setInterests("interests" in userFilteredData ? userFilteredData["interests"] as string[] : []);
            }
            catch (err) {
                console.error(err);
            }
        };

        getUserData();
    }, []);

    const changeName = async () => {
        try {
            await updateDoc(userDbRef, {name: newName});
            setName(newName);
            setNewName("");
        }
        catch(err) {
            console.log(err);
        }
    }

    const changeAge = async () => {
        try {
            if (typeof newAge === "number") {
                await updateDoc(userDbRef, {age: newAge});
                setAge(newAge);
                setNewAge("");
            }
        }
        catch(err) {
            console.log(err);
        }
    }

    const addInterest = async () => {
        try {
            await updateDoc(userDbRef, {interests: [...interests, interest]});
            setInterests([...interests, interest]);
            setInterest("");
        }
        catch(err) {
            console.log(err);
        }
    }

    const removeInterest = async (interestToRemove: string) => {
        try {
            const newInterests = interests.filter((interest) => interest !== interestToRemove);
            await updateDoc(userDbRef, {interests: newInterests});
            setInterests(newInterests);
        }
        catch(err) {
            console.log(err);
        }
    }

    const deleteAccount = async () => {
        try {
            if (auth?.currentUser) {
                await deleteUser(auth.currentUser);
                await deleteDoc(userDbRef);
                navigate("../login");
            }
        }
        catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="profile" style={{display: 'flex', flexDirection: 'column'}}>
            <div>
                <p>Current Name: {name}</p>
                <input
                    placeholder="New Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                />

                <button onClick={changeName}> Update Name </button>
            </div>

            <div>
                <p>Current Age: {age}</p>
                <input
                    placeholder="New Age"
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(Number(e.target.value))}
                />
                <button onClick={changeAge}> Update Age </button>
            </div>

            <div className="interest">
                <input
                    placeholder="Add Interest"
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                />
                <button onClick={addInterest}> Add </button>
            </div>

            {interests.length > 0 ? <strong>Interests:</strong> : <strong>No Interests Added</strong>}

            {interests.map((interest) => (
                <p>{interest} <button onClick={() => removeInterest(interest)}> Remove </button></p>
            ))}

            <button onClick={deleteAccount}> Delete Account </button>
            <button onClick={() => navigate("/")}> Go Back to Homepage </button>
        </div>
    )
}