import { db, auth } from "../config/firebase"
import {  deleteUser } from 'firebase/auth';
import { useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom';
import { getDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Navbar } from "../Navbar"
import { Button, Input } from '@chakra-ui/react'

export const Profile = () => {
    const navigate = useNavigate();

    const [name, setName] = useState<string>("");
    const [newName, setNewName] = useState<string>("");

    const [age, setAge] = useState<number>(-1);
    const [newAge, setNewAge] = useState<number | "">("");

    const [interest, setInterest] = useState<string>("");
    const [interests, setInterests] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

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
            } finally {
                setLoading(false); 
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

    if (loading) {
        return null;
    }

    return (
        <>
            <Navbar />
            <div className="profile" style={{display: 'flex', flexDirection: 'column'}}>
                <div>
                    <strong style={{fontSize: 20}}> {name}'s Profile </strong>
                    
                    <p>Current Name: {name}</p>
                    <Input
                        placeholder="New Name"
                        borderColor="gray.500"
                  borderRadius="md"
                  focusBorderColor="blue.500"
                  marginBottom="10px"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />

                    <Button onClick={changeName}> Update Name </Button>
                </div>

                <div>
                    <p>Current Age: {age}</p>
                    <Input
                        placeholder="New Age"
                        borderColor="gray.500"
                  borderRadius="md"
                  focusBorderColor="blue.500"
                  marginBottom="10px"
                        type="number"
                        value={newAge}
                        onChange={(e) => setNewAge(Number(e.target.value))}
                    />
                    <Button onClick={changeAge} marginBottom="10px"> Update Age </Button>
                </div>

                <div className="interest">
                    <Input
                        placeholder="Add Interest"
                        borderColor="gray.500"
                  borderRadius="md"
                  focusBorderColor="blue.500"
                  marginBottom="10px"
                        value={interest}
                        onChange={(e) => setInterest(e.target.value)}
                    />
                    <Button onClick={addInterest}> Add </Button>
                </div>

                {interests.length > 0 ? <strong>Interests:</strong> : <strong>No Interests Added</strong>}

                {interests.map((interest) => (
                    <p>{interest} <Button onClick={() => removeInterest(interest)} marginBottom="10px"> Remove </Button></p>
                ))}

                <Button onClick={deleteAccount} marginBottom="10px"> Delete Account </Button>
                <Button onClick={() => navigate("/")} marginBottom="10px"> Go Back to Homepage </Button>
            </div>
        </>
    )
}