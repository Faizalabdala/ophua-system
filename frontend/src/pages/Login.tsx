import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Fade,
  Link,
} from "@mui/material";
import {
  Lock as LockIcon,
  Email as EmailIcon,
  Visibility,
  VisibilityOff,
  Business as BusinessIcon,
} from "@mui/icons-material";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Preencha todos os campos");
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError("Credenciais inválidas. Verifique o email e password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #000000 0%, #333333 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background pattern */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: 0.3,
        }}
      />

      <Fade in={true} timeout={800}>
        <Container maxWidth="sm">
          <Paper
            elevation={24}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 3,
              background: "#ffffff",
              position: "relative",
              border: "2px solid #000000",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                  border: "3px solid #000000",
                  backgroundColor: "#000000",
                }}
              >
                <Box
                  component="img"
                  src="/logo.png"
                  alt="Ophua Logo"
                  sx={{
                    height: 50,
                    width: "auto",
                    filter: "brightness(0) invert(1)",
                  }}
                  onError={(e) => {
                    // Fallback se o logotipo não carregar
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div style="
                          width: 50px;
                          height: 50px;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          color: white;
                          font-size: 24px;
                          font-weight: bold;
                        ">
                          O
                        </div>
                      `;
                    }
                  }}
                />
              </Box>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  color: "#000000",
                  letterSpacing: "-0.5px",
                }}
              >
                OPHUA CONTROL
              </Typography>

              <Typography
                variant="body1"
                color="textSecondary"
                sx={{ fontWeight: 500 }}
              >
                Sistema de Gestão de Pedidos
              </Typography>
            </Box>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    border: "1px solid #d32f2f",
                    backgroundColor: "#ffebee",
                  }}
                >
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: "#000000" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover fieldset": {
                      borderColor: "#000000",
                    },
                  },
                }}
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: "#000000" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: "#000000" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 4,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover fieldset": {
                      borderColor: "#000000",
                    },
                  },
                }}
                disabled={loading}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  backgroundColor: "#000000",
                  color: "#ffffff",
                  "&:hover": {
                    backgroundColor: "#333333",
                  },
                  fontSize: "1rem",
                  fontWeight: 600,
                  borderRadius: 2,
                  border: "2px solid #000000",
                  "&:disabled": {
                    backgroundColor: "#666666",
                    borderColor: "#666666",
                  },
                }}
              >
                {loading ? "A ENTRAR..." : "ENTRAR NO SISTEMA"}
              </Button>
            </form>

            {/* Footer */}
            <Box
              sx={{
                mt: 4,
                pt: 3,
                borderTop: "1px solid #e0e0e0",
                textAlign: "center",
              }}
            >
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ fontWeight: 500 }}
              >
                © {new Date().getFullYear()} OPHUA. Todos os direitos
                reservados.
              </Typography>
              <Typography
                variant="caption"
                color="textSecondary"
                display="block"
                sx={{
                  mt: 1,
                  fontSize: "0.7rem",
                  fontWeight: 500,
                }}
              >
                Sistema de acesso restrito. Utilização exclusiva para pessoal
                autorizado.
              </Typography>

              {/* Link de suporte */}
              <Box sx={{ mt: 2 }}>
                <Link
                  href="mailto:suporte@ophua.com"
                  variant="caption"
                  sx={{
                    color: "#000000",
                    fontWeight: 600,
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Problemas no acesso? Contacte suporte
                </Link>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Fade>
    </Box>
  );
};

export default Login;
