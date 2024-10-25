import Story from "./Story"
import Storyverse from './storyverse.png';
import { Login } from "./auth/Login"
import { Signup } from "./auth/Signup"
import { Profile } from "./auth/Profile"
import { Routes, Route } from 'react-router-dom';
import { Image } from '@chakra-ui/react'
import { auth } from "./config/firebase"
import { Link, useNavigate } from 'react-router-dom';
import "./Navbar.css"

export const Navbar = () => {
    const navigate = useNavigate();

    const logout = async () => {
        try {
            await logout();
            navigate("/login");
        }
        catch(err) {
            console.error(err);
        }
    }

    return (
        <nav className="navbar">
            <div>
                <Image className="navbar-logo" src={Storyverse} />
            </div>

            <ul className="navbar-links">
                <li> 
                    <Link to="/"> Stories </Link>
                </li>

                <li> 
                    <Link to="/grammar"> Grammar </Link>
                </li>

                {auth?.currentUser ? (
                <>
                    <li>
                        <Link to="/profile"> Profile </Link>
                    </li>
                    
                    <li>
                        <button onClick={logout}> Logout </button>
                    </li>
                </>
                ) : (
                    <li>
                        <Link to="/login"> Login </Link>
                    </li>
                )
                }
            </ul>
        </nav>

    );
}