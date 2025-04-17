import React, { useState } from "react";
import { ThemeProvider, styled } from "@mui/material/styles";
import {
  Box,
  CssBaseline,
  Button,
  TextField,
  Typography,
  Paper,
  Link,
  Container,
  Avatar
} from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0088cc",
      light: "#35a3e0",
      dark: "#006699"
    },
    secondary: {
      main: "#f5f5f5",
      light: "#ffffff",
      dark: "#e0e0e0"
    }
  }
});

const AuthContainer = styled(Container)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(2),
  backgroundColor: "#f5f5f5"
}));

const AuthPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  maxWidth: 400,
  width: "100%",
  borderRadius: 16
}));

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    phone: "",
    avatar: "default-avatar",
    newPassword: "",
    resetCode: "",
    code: "", 
    firstName: "",
    lastName: "",
    gender: "Male"
  }); 
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const password = formData.password;
    const hasUpperCase = /[A-Z]/.test(password);
    const maxLength = password.length <= 10;

    if (!hasUpperCase || !maxLength) {
      setIsLoading(false);
      setError("Mật khẩu phải có ít nhất 1 kí tự in Hoa và tối đa 10 kí tự.");
      return;
    }
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setIsLoading(false);
      setError("Mật khẩu không đúng.");
      return;
    }
    try {
      const endpoint = isLogin
        ? "http://localhost:8080/auth/login"
        : "http://localhost:8080/auth/register";

      const requestBody = isLogin
        ? {
          username: formData.username,
          password: formData.password,
        }
        : {
          username: formData.username,
          password: formData.password,
          email: formData.email,
          phone: formData.phone,
          avatar: formData.avatar,
        };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("userId", data.userId);

      console.log("Success:", data);
      navigate("/home");

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthContainer>
        <AuthPaper elevation={3}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <Avatar
              src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg"
              alt="Zalo Icon"
              sx={{ width: 64, height: 64 }}
            />
          </Box>
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            {isLogin ? "Sign In" : "Sign Up"}
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

<Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            {isResetPassword ? (
              resetEmail ? (
                <>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Reset Code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    helperText="Enter the Code sent to your email"
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="New Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    onClick={async () => {
                      try {
                        const response = await fetch('http://localhost:8080/auth/reset-password', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            code: formData.code,
                            password: formData.password
                          })
                        });ai 
                        
                        if (!response.ok) {
                          throw new Error('Failed to reset password');
                        }
                        
                        setIsResetPassword(false);
                        setIsLogin(true);
                        setResetEmail('');
                        setError('Password reset successful! Please login with your new password.');

                      } catch (err) {
                        setError(err.message);
                      }
                    }}
                  >
                    Reset Password
                  </Button>
                </>
              ) : (
                <>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    name="email"
                    helperText="Enter your email to receive a reset pass"
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    onClick={async () => {
                      try {
                        const response = await fetch('http://localhost:8080/auth/forgot-password', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            email: formData.email
                          })
                        });
                        
                        if (!response.ok) {
                          throw new Error('Failed to send reset code');
                        }
                        
                        setResetEmail(formData.email);
                        setError('Reset code sent to your email!');
                      } catch (err) {
                        setError(err.message);
                      }
                    }}
                  >
                    Send Reset Code
                  </Button>
                </>
              )
            ) : (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Username"
                  name="username"
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleChange}
                />
                {!isLogin && (
                  <>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      select
                      label="Gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      SelectProps={{
                        native: true
                      }}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </TextField>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </>
                )}
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {!isLogin && (
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                )}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : (isLogin ? "Sign In" : "Sign Up")}
                </Button>
              </>
            )}
            <Box sx={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 1 }}>
              {!isResetPassword && (
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </Link>
              )}
              {isLogin && !isResetPassword && (
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => setIsResetPassword(true)}
                  sx={{ 
                    color: "primary.main",
                    cursor: "pointer",
                    textDecoration: "underline"
                  }}
                >
                  Forgot Password?
                </Link>
              )}
              {isResetPassword && (
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => {
                    setIsResetPassword(false);
                    setIsLogin(true);
                    setResetEmail('');
                  }}
                >
                  Back to Login
                </Link>
              )}
            </Box>
          </Box>
        </AuthPaper>
      </AuthContainer>
    </ThemeProvider>
  );
};

export default Login;