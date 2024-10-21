import Story from "./Story"
import { Grammar } from "./grammar/Grammar"
import { Login } from "./auth/Login"
import { Signup } from "./auth/Signup"
import { Profile } from "./auth/Profile"
import { Routes, Route } from 'react-router-dom';


function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Story />} />
        <Route path="/grammar" element={<Grammar />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}

export default App;
