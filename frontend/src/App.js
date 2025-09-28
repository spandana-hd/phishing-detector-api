<<<<<<< HEAD
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Card,
  CardContent,
} from "@mui/material";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "./App.css"; // Make sure file name matches exactly

function App() {
  const [emailText, setEmailText] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [replyToEmail, setReplyToEmail] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [domainMismatch, setDomainMismatch] = useState(null);
  const [history, setHistory] = useState([]);

  const handleAnalyze = () => {
    const isPhishing = emailText.toLowerCase().includes("verify");
    const pred = isPhishing ? "PHISHING" : "LEGITIMATE";
    const conf = isPhishing ? 78.5 : 62.0;
    const mismatch = fromEmail !== replyToEmail ? "YES" : "NO";

    setPrediction(pred);
    setConfidence(conf);
    setDomainMismatch(mismatch);

    const newEntry = {
      time: new Date().toLocaleTimeString(),
      prediction: pred,
      confidence: conf,
      from: fromEmail,
    };

    setHistory([newEntry, ...history]);
  };

  const chartData = {
    labels: history.map((h) => h.time).reverse(),
    datasets: [
      {
        label: "Confidence Score",
        data: history.map((h) => h.confidence).reverse(),
        fill: false,
        borderColor: "#1976d2",
        backgroundColor: "#1976d2",
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="app-background">
      <AppBar position="static" className="appbar">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            🛡️ Phishing Email Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Container className="container">
        <Box display="grid" gridTemplateColumns="2fr 1fr" gap={3}>
          {/* Left: Analysis Form */}
          <Paper className="card-section">
            <Typography variant="h6" gutterBottom>
              Analyze Email
            </Typography>

            <TextField
              label="Paste email text"
              multiline
              rows={6}
              fullWidth
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="From Email"
              fullWidth
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Reply-To Email"
              fullWidth
              value={replyToEmail}
              onChange={(e) => setReplyToEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAnalyze}
              fullWidth
            >
              Analyze
            </Button>

            {prediction && (
              <Card className="result-card">
                <CardContent>
                  <Typography>
                    <strong>Prediction:</strong>{" "}
                    <span
                      className={
                        prediction === "PHISHING"
                          ? "phishing-text"
                          : "legit-text"
                      }
                    >
                      {prediction}
                    </span>
                  </Typography>
                  <Typography>
                    <strong>Confidence:</strong> {confidence.toFixed(2)}%
                  </Typography>
                  <Typography>
                    <strong>Domain Mismatch:</strong> {domainMismatch}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Paper>

          {/* Right: Chart */}
          <Paper className="card-section">
            <Typography variant="h6" gutterBottom>
              📈 Detection Trend
            </Typography>
            <Line data={chartData} />
          </Paper>
        </Box>

        {/* History Table */}
        <Paper className="card-section">
          <Typography variant="h6" gutterBottom>
            📝 Analysis History
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Time</strong></TableCell>
                  <TableCell><strong>Prediction</strong></TableCell>
                  <TableCell><strong>Confidence</strong></TableCell>
                  <TableCell><strong>From</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((h, i) => (
                  <TableRow key={i}>
                    <TableCell>{h.time}</TableCell>
                    <TableCell
                      className={
                        h.prediction === "PHISHING"
                          ? "phishing-text"
                          : "legit-text"
                      }
                    >
                      {h.prediction}
                    </TableCell>
                    <TableCell>{h.confidence.toFixed(2)}%</TableCell>
                    <TableCell>{h.from}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </div>
  );
}

export default App;
=======
import React, { useState, useEffect } from "react";
import api, { setAuthToken } from "./api";
import {
  Container, Typography, Card, CardContent, TextField, Button,
  CircularProgress, Alert, Grid, Table, TableBody, TableCell,
  TableHead, TableRow, ThemeProvider, createTheme
} from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#00e676" },
    background: { default: "#121212", paper: "#1e1e1e" },
    text: { primary: "#E0E0E0" }
  }
});

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loginData, setLoginData] = useState({ username: "admin", password: "admin123" });
  const [emailData, setEmailData] = useState({ text: "", from_email: "", reply_to: "" });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const formData = new URLSearchParams();
      formData.append('username', loginData.username);
      formData.append('password', loginData.password);
      
      const res = await api.post("/v1/auth/token", formData);
      const accessToken = res.data.access_token;
      
      localStorage.setItem("token", accessToken);
      setAuthToken(accessToken);
      setToken(accessToken);
    } catch (err) {
      setError("Login failed! Check credentials or backend server.");
    }
    setIsLoading(false);
  };

  const analyzeEmail = async () => {
    if (!emailData.text.trim()) return setError("Email text cannot be empty!");
    setIsLoading(true);
    setResult(null);
    setError("");
    try {
      const { data } = await api.post("/v1/predict/", emailData);
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
    setAuthToken(null);
    setToken(null);
  };

  const trendData = [...history].reverse().map(e => ({
    time: e.timestamp,
    phishing: e.prediction === "phishing" ? 1 : 0,
  }));

  if (!token) {
    // RENDER LOGIN PAGE
    return (
      <ThemeProvider theme={darkTheme}>
        <Container component="main" maxWidth="xs" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <Card>
            <CardContent style={{ padding: '2rem' }}>
              <Typography variant="h4" align="center">🔐 SOC Login</Typography>
              <form onSubmit={handleLogin} style={{ marginTop: '1rem' }}>
                <TextField label="Username" variant="outlined" margin="normal" required fullWidth value={loginData.username} onChange={(e) => setLoginData({ ...loginData, username: e.target.value })} />
                <TextField label="Password" type="password" variant="outlined" margin="normal" required fullWidth value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />
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

  // RENDER THE FULL DASHBOARD
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
>>>>>>> cd7b4de2c825b18386b879087938c5f72947fda6
