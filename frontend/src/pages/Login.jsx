// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Lock as LockIcon,
  Email as EmailIcon,
  Visibility,
  VisibilityOff,
  Security as SecurityIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

// Cores da paleta
const COLORS = {
  primary: '#000000',
  secondary: '#FF6B35',
  accent: '#4A4A4A',
  light: '#F5F5F5',
  white: '#FFFFFF',
  darkGray: '#1A1A1A',
  mediumGray: '#666666',
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Preencha todos os campos');
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Credenciais inválidas. Verifique o email e password.');
    } finally {
      setLoading(false);
    }
  };

  // Tamanhos responsivos
  const getResponsiveValue = (mobile, tablet, desktop) => {
    if (isMobile) return mobile;
    if (isTablet) return tablet;
    return desktop;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: `linear-gradient(135deg, ${COLORS.darkGray} 0%, ${COLORS.primary} 50%, ${COLORS.secondary} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: getResponsiveValue(2, 3, 4),
        overflow: 'auto',
      }}
    >
      {/* Background pattern */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 80%, ${COLORS.secondary}15 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${COLORS.secondary}10 0%, transparent 50%)
          `,
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      />

      <Fade in={true} timeout={800}>
        <Box
          sx={{
            width: '100%',
            maxWidth: getResponsiveValue('100%', '450px', '500px'),
            mx: 'auto',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Paper
            elevation={24}
            sx={{
              p: getResponsiveValue(3, 4, 5),
              borderRadius: 3,
              background: COLORS.white,
              position: 'relative',
              border: '3px solid #000000',
              overflow: 'hidden',
              boxShadow: `0 20px 60px ${COLORS.primary}40`,
            }}
          >
            {/* Elemento decorativo superior */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`,
              }}
            />

            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: getResponsiveValue(70, 80, 80),
                  height: getResponsiveValue(70, 80, 80),
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  border: '3px solid #000000',
                  backgroundColor: '#000000',
                  boxShadow: `0 8px 24px ${COLORS.secondary}40`,
                }}
              >
                <Box
                  component="img"
                  src="/logo.png"
                  alt="Ophua Logo"
                  sx={{
                    height: getResponsiveValue(40, 50, 50),
                    width: 'auto',
                    filter: 'brightness(0) invert(1)',
                  }}
                  onError={(e) => {
                    const target = e.target;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div style="
                          width: 100%;
                          height: 100%;
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
                  color: '#000000',
                  letterSpacing: '-0.5px',
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
                    border: '1px solid #d32f2f',
                    backgroundColor: '#ffebee',
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
                      <EmailIcon sx={{ color: COLORS.secondary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: COLORS.secondary,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: COLORS.secondary,
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: COLORS.secondary,
                  },
                }}
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: COLORS.secondary }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: COLORS.secondary }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 4,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: COLORS.secondary,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: COLORS.secondary,
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: COLORS.secondary,
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
                  backgroundColor: COLORS.primary,
                  color: COLORS.white,
                  '&:hover': {
                    backgroundColor: COLORS.darkGray,
                  },
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  border: '2px solid #000000',
                  '&:disabled': {
                    backgroundColor: COLORS.mediumGray,
                    borderColor: COLORS.mediumGray,
                  },
                  textTransform: 'uppercase',
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        border: `2px solid ${COLORS.white}`,
                        borderTopColor: 'transparent',
                        animation: 'spin 1s linear infinite',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' },
                        },
                      }}
                    />
                    A ENTRAR...
                  </Box>
                ) : (
                  'ENTRAR NO SISTEMA'
                )}
              </Button>

              {/* Link de recuperação de password */}
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Link
                  href="#"
                  variant="body2"
                  sx={{
                    color: COLORS.mediumGray,
                    fontWeight: 500,
                    textDecoration: 'none',
                    '&:hover': {
                      color: COLORS.secondary,
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Esqueceu a password?
                </Link>
              </Box>
            </form>

            {/* Footer */}
            <Box
              sx={{
                mt: 4,
                pt: 3,
                borderTop: '1px solid #e0e0e0',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ fontWeight: 500 }}
              >
                © {new Date().getFullYear()} OPHUA. Todos os direitos reservados.
              </Typography>
              <Typography
                variant="caption"
                color="textSecondary"
                display="block"
                sx={{
                  mt: 1,
                  fontSize: '0.7rem',
                  fontWeight: 500,
                }}
              >
                Sistema de acesso restrito. Utilização exclusiva para pessoal autorizado.
              </Typography>

              {/* Link de suporte */}
              <Box sx={{ mt: 2 }}>
                <Link
                  href="mailto:suporte@ophua.com"
                  variant="caption"
                  sx={{
                    color: COLORS.secondary,
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Problemas no acesso? Contacte suporte
                </Link>
              </Box>
            </Box>
          </Paper>

          {/* Versão Mobile - Adiciona padding extra */}
          {isMobile && (
            <Box sx={{ height: 20 }} />
          )}
        </Box>
      </Fade>
    </Box>
  );
};

export default Login;