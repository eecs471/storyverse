import React from "react";
import { useState, useEffect } from "react";
import { auth, db } from "../config/firebase"
import { getDoc, doc, deleteDoc, updateDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Textarea, Button, Box, Input } from '@chakra-ui/react'

export interface LeaderboardEntry {
    name: string;
    score: number;
}
export const Leaderboard = () => {
    const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);

    useEffect(() => {
        const fetchLeaderboard = async() => {
            try {
                // Get Top 100 Grammar Scores from Users collection
                const scoreQuery = query(
                    collection(db, "users"),
                    orderBy("grammarQuestionsAnsweredCorrectly", "desc"),
                    limit(100)
                );
                const scoreQueryResults = await getDocs(scoreQuery);
                const entries = scoreQueryResults.docs.map(doc => ({ name: doc.data().name, score: doc.data().grammarQuestionsAnsweredCorrectly}))
                setLeaderboardEntries(entries);
            } catch(err) {
                console.error(err);
            }
        };

        fetchLeaderboard();
    }, []);

    return (
        <>
            {leaderboardEntries ?
            <Box>
                <table>
                    <caption>Grammar Leaderboard</caption>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Score</th>
                        </tr>
                    </thead>
                    <tbody> 
                        {leaderboardEntries.map((leaderboardEntry, index) => (
                            <tr key={index}>
                                <td> {index + 1} </td>
                                <td> {leaderboardEntry.name} </td>
                                <td> {leaderboardEntry.score} </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Box>
            : 
                <text> Loading... </text>
            }
        </>
    )
}