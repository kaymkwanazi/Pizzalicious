import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';
import { useUser } from "@/components/UserContext";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useUser();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post("/api/auth/login", { email, password });
      const { token } = response.data;

      if (!token || typeof token !== 'string' || !token.match(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)) {
        setError('Invalid token received from server');
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);

      try {
        const decodedUser = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000);
        if (decodedUser.exp && decodedUser.exp < currentTime) {
          setError('Token has expired');
          setLoading(false);
          return;
        }

        setUser(decodedUser); // Update the user in UserContext
        router.push("/");
      } catch (decodeError) {
        setError(`Failed to decode token: ${decodeError.message}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f2f5',
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#333',
            marginBottom: '24px',
          }}
        >
          Login
        </h2>
        {loading ? (
          <p style={{ color: '#007bff', textAlign: 'center' }}>Redirecting...</p>
        ) : (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333',
                  marginBottom: '8px',
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.3s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#007bff')}
                onBlur={(e) => (e.target.style.borderColor = '#ccc')}
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333',
                  marginBottom: '8px',
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.3s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#007bff')}
                onBlur={(e) => (e.target.style.borderColor = '#ccc')}
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = '#0056b3')}
              onMouseOut={(e) => (e.target.style.backgroundColor = '#007bff')}
            >
              Login
            </button>
          </form>
        )}
        {error && <p style={{ color: '#dc3545', textAlign: 'center', marginTop: '20px' }}>{error}</p>}
        {success && <p style={{ color: '#28a745', textAlign: 'center', marginTop: '20px' }}>{success}</p>}
      </div>
    </div>
  );
}