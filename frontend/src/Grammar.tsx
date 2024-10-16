import { Navbar } from "./Navbar"
import { Link, useNavigate } from 'react-router-dom';
import { auth } from "./config/firebase"
import React, { useState, useEffect } from 'react';

export const Grammar = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Ensure user is logged in before rendering
        if (!auth.currentUser) {
            navigate('/login');
        }
    }, []);

    return (
        <>
            <Navbar />
            <strong> Grammar Quizzes here? </strong>
        </>
    )
}