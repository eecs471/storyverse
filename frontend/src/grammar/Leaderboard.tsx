import React from "react";
import { useState, useEffect } from "react";
import { auth, db } from "../config/firebase"
import { getDoc, doc, deleteDoc, updateDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Box, Table, Thead, Tbody, Tr, Th, Td, TableCaption } from "@chakra-ui/react";

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
            <Table colorScheme="teal" maxWidth={200}>
                <TableCaption placement="top" fontSize="lg" fontWeight="bold"> Grammar Leaderboard </TableCaption>
                <Thead>
                    <Tr>
                        <Th isNumeric>#</Th>
                        <Th>Name</Th>
                        <Th isNumeric>Score</Th>
                    </Tr>
                </Thead>
                <Tbody> 
                    {leaderboardEntries.map((leaderboardEntry, index) => (
                        <Tr key={index} bg="blue.100" _hover={{ bg: "blue.200" }}>
                            <Td isNumeric> {index + 1} </Td>
                            <Td> {leaderboardEntry.name} </Td>
                            <Td isNumeric> {leaderboardEntry.score} </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
            : 
                <text> Loading... </text>
            }
        </>
    )
}