import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch users from backend
  useEffect(() => {
    let isMounted = true; // Prevent memory leaks

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/users/lists');
        if (isMounted) {
          setUsers(response.data.users);
        }
      } catch (error) {
        if (isMounted) {
          setError(error.response?.data?.message || error.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isMounted = false; // Cleanup function
    };
  }, []);

  // Create a new user
  const handleCreateUser = async (e) => {
    e.preventDefault(); // Prevent form reload
    setCreating(true);
    setError(null);
    setSuccessMessage('');

    try {
      const response = await axios.post('http://localhost:5000/users/create', { name, email });

      // Update UI with new user
      setUsers((prevUsers) => [...prevUsers, response.data]);
      setSuccessMessage('User created successfully!');

      // Clear input fields
      setName('');
      setEmail('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="container">
      <h1>Users</h1>

      {/* Create User Form */}
      <form onSubmit={handleCreateUser} className="user-form">
        <input
          type="text"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={creating}>
          {creating ? 'Creating...' : 'Create User'}
        </button>
      </form>

      {/* Success Message */}
      {successMessage && <p className="success">{successMessage}</p>}

      {/* Error Message */}
      {error && <p className="error">{error}</p>}

      {/* Loading Indicator */}
      {loading && <p className="loading">Loading...</p>}

      {/* Display Users List */}
      {!loading && !error && (
        users.length > 0 ? (
          <ul className="user-list">
            {users.map(user => (
              <li key={user._id}>
                <strong>{user.name}</strong> : {user.email}
              </li>
            ))}
          </ul>
        ) : (
          <p>No users found</p>
        )
      )}
    </div>
  );
}

export default App;
