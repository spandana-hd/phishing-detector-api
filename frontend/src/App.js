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
