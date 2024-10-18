import Story from "./Story"
import { Login } from "./auth/Login"
import { Signup } from "./auth/Signup"
import { Profile } from "./auth/Profile"
import { Routes, Route } from 'react-router-dom';
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
            <div className="navbar-logo">
                Cool Logo goes here (TODO)
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