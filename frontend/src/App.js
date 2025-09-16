import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container, Typography, Card, CardContent, TextField, Button,
  CircularProgress, Alert, Grid, Table, TableBody, TableCell,
  TableHead, TableRow, ThemeProvider, createTheme
} from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

// --- Configuration ---
const API_URL = "http://127.0.0.1:8000";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#00e676" },
    background: { default: "#121212", paper: "#1e1e1e" },
    text: { primary: "#E0E0E0" }
  }
});

// --- Main App Component ---
function App() {
  // --- State Variables ---
  const [token, setToken] = useState("");
  const [loginData, setLoginData] = useState({ username: "admin", password: "admin123" });
  const [emailData, setEmailData] = useState({ text: "", from_email: "", reply_to: "" });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Effects ---
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // --- API Functions ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const formData = new URLSearchParams();
      formData.append('username', loginData.username);
      formData.append('password', loginData.password);
      const res = await axios.post(`${API_URL}/token`, formData);
      const accessToken = res.data.access_token;
      localStorage.setItem("token", accessToken);
      setToken(accessToken);
    } catch (err) {
      setError("Login failed! Check credentials.");
    }
    setIsLoading(false);
  };

  const analyzeEmail = async () => {
    if (!emailData.text.trim()) return setError("Email text cannot be empty!");
    setIsLoading(true);
    setResult(null);
    setError("");
    try {
      const { data } = await axios.post(
        `${API_URL}/predict/`, 
        emailData, // Send the whole emailData object
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(data);
      const newEntry = {
        ...emailData,
        prediction: data.prediction,
        confidence: (data.confidence * 100).toFixed(2),
        timestamp: new Date().toLocaleTimeString(),
      };
      setHistory([newEntry, ...history.slice(0, 9)]);
    } catch (err) {
      setError("Analysis failed. Your session may have expired.");
    }
    setIsLoading(false);
  };
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  // --- Chart & Table Data ---
  const trendData = [...history].reverse().map(e => ({
    time: e.timestamp,
    phishing: e.prediction === "phishing" ? 1 : 0,
  }));

  // --- Render Logic ---
  if (!token) {
    // RENDER LOGIN PAGE
    return (
      <ThemeProvider theme={darkTheme}>
        <Container component="main" maxWidth="xs" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <Card>
            <CardContent style={{ padding: '2rem' }}>
              <Typography variant="h4" align="center" gutterBottom>🔐 SOC Login</Typography>
              <form onSubmit={handleLogin}>
                <TextField
                  label="Username"
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                />
                <TextField
                  label="Password"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                />
                <Button type="submit" fullWidth variant="contained" color="primary" style={{ marginTop: '1rem' }} disabled={isLoading}>
                  {isLoading ? <CircularProgress size={24} /> : "Login"}
                </Button>
                {error && <Alert severity="error" style={{ marginTop: '1rem' }}>{error}</Alert>}
              </form>
            </CardContent>
          </Card>
        </Container>
      </ThemeProvider>
    );
  }

  // RENDER DASHBOARD
  return (
    <ThemeProvider theme={darkTheme}>
      <Container maxWidth="lg" style={{ marginTop: "30px" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h3" gutterBottom style={{ color: "#00e676" }}>
            🛡️ Phishing Email SOC Dashboard
          </Typography>
          <Button variant="outlined" color="primary" onClick={handleLogout}>Logout</Button>
        </div>
        
        <Grid container spacing={3}>
          {/* Email Input & Result */}
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Typography variant="h6">Analyze Email</Typography>
                <TextField
                  label="Paste email text..."
                  multiline rows={8} fullWidth
                  value={emailData.text}
                  onChange={e => setEmailData({ ...emailData, text: e.target.value })}
                  margin="normal"
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField label="From Email" fullWidth value={emailData.from_email} onChange={e => setEmailData({ ...emailData, from_email: e.target.value })} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Reply-To Email" fullWidth value={emailData.reply_to} onChange={e => setEmailData({ ...emailData, reply_to: e.target.value })} />
                  </Grid>
                </Grid>
                <Button
                  fullWidth variant="contained" style={{ marginTop: 20 }} color="primary"
                  onClick={analyzeEmail} disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : "Analyze"}
                </Button>
                {error && <Alert severity="warning" style={{ marginTop: 20 }}>{error}</Alert>}
                {result && (
                  <Alert
                    severity={result.prediction === "phishing" ? "error" : "success"}
                    style={{ fontSize: 16, marginTop: 20 }}
                  >
                    <strong>Prediction:</strong> {result.prediction.toUpperCase()} <br />
                    <strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}% <br />
                    <strong>Domain Mismatch:</strong> {result.domain_mismatch ? "⚠️ YES" : "NO"}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Trend Chart */}
          <Grid item xs={12} md={5}>
            <Card style={{ padding: 15 }}>
              <Typography variant="h6">📈 Detection Trend</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <XAxis dataKey="time" tick={{ fill: "#E0E0E0" }} />
                  <YAxis tick={{ fill: "#E0E0E0" }} />
                  <Tooltip wrapperStyle={{ backgroundColor: '#333' }} />
                  <Legend />
                  <Line type="monotone" dataKey="phishing" name="Phishing" stroke="#ff1744" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* History Table */}
          <Grid item xs={12}>
            <Card style={{ padding: 15 }}>
              <Typography variant="h6">📝 Analysis History</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ color: "#00e676" }}>Time</TableCell>
                    <TableCell style={{ color: "#00e676" }}>Prediction</TableCell>
                    <TableCell style={{ color: "#00e676" }}>Confidence</TableCell>
                    <TableCell style={{ color: "#00e676" }}>From</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((e, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{e.timestamp}</TableCell>
                      <TableCell style={{ color: e.prediction === "phishing" ? "#ff1744" : "#00e676" }}>
                        {e.prediction.toUpperCase()}
                      </TableCell>
                      <TableCell>{e.confidence}%</TableCell>
                      <TableCell>{e.from_email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;