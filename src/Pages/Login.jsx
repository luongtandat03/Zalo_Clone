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
  Avatar,
  InputAdornment,
  IconButton,
  MenuItem
} from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { AccountCircle, Lock } from "@mui/icons-material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0088cc",
      light: "#35a3e0",
      dark: "#006699"
    },
    secondary: {
      main: "#f5f5f5"
    }
  },
  typography: {
    fontFamily: "Roboto, sans-serif"
  }
});

const AuthContainer = styled(Container)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  maxWidth: "100% !important",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(2),
  backgroundColor: "#e6f2fb"
}));

const AuthPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  maxWidth: 400,
  width: "100%",
  borderRadius: 16,
  backgroundColor: "#ffffff",
  border: "1px solid #b3e5fc",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
}));

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    gender: "MALE",
    birthday: ""
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

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
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
          password: formData.password
        }
        : {
          username: formData.username,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
          birthday: formData.birthday,
          avatar: formData.avatar
        };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
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
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2
            }}
          >
            <Avatar
              src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg"
              alt="Zalo Icon"
              sx={{
                width: 50,
                height: 50,
                bgcolor: "#ffffff",
                borderRadius: 2,
                border: "2px solid #0088cc"
              }}
            />
          </Box>
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            {isLogin ? "Đăng nhập" : "Đăng ký"}
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
                    helperText="Nhập mã từ email"
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Mật khẩu mới"
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
                        const response = await fetch(
                          "http://localhost:8080/auth/reset-password",
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                              code: formData.code,
                              password: formData.password
                            })
                          }
                        );

                        if (!response.ok) {
                          throw new Error("Reset mật khẩu thất bại");
                        }

                        setIsResetPassword(false);
                        setIsLogin(true);
                        setResetEmail("");
                        setError("Reset thành công! Vui lòng đăng nhập.");
                      } catch (err) {
                        setError(err.message);
                      }
                    }}
                  >
                    Reset mật khẩu
                  </Button>
                </>
              ) : (
                <>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    name="email"
                    helperText="Nhập email để nhận mã reset"
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          "http://localhost:8080/auth/forgot-password",
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                              email: formData.email
                            })
                          }
                        );

                        if (!response.ok) {
                          throw new Error("Gửi mã thất bại");
                        }

                        setResetEmail(formData.email);
                        setError("Đã gửi mã đến email của bạn!");
                      } catch (err) {
                        setError(err.message);
                      }
                    }}
                  >
                    Gửi mã xác nhận
                  </Button>
                </>
              )
            ) : (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Tên đăng nhập"
                  name="username"
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircle />
                      </InputAdornment>
                    )
                  }}
                />
                {!isLogin && (
                  <>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      label="Họ"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      label="Tên"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      label="Giới tính"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      select
                      SelectProps={{ native: true }}
                    >
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </TextField>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      label="Email"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      label="Số điện thoại"
                      name="phone"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      label="Ngày sinh"
                      name="birthday"
                      type="date"
                      value={formData.birthday}
                      onChange={handleChange}
                      InputLabelProps={{
                        shrink: true, 
                      }}
                    />
                  </>
                )}
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Mật khẩu"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleTogglePassword} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                {!isLogin && (
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Nhập lại mật khẩu"
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
                  sx={{
                    mt: 3,
                    mb: 2,
                    backgroundColor: "#0088cc",
                    "&:hover": {
                      backgroundColor: "#006699"
                    }
                  }}
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Đang xử lý..."
                    : isLogin
                      ? "Đăng nhập"
                      : "Đăng ký"}
                </Button>
              </>
            )}

            <Box
              sx={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: 1
              }}
            >
              {!isResetPassword && (
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin
                    ? "Chưa có tài khoản? Đăng ký"
                    : "Đã có tài khoản? Đăng nhập"}
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
                  Quên mật khẩu?
                </Link>
              )}
              {isResetPassword && (
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => {
                    setIsResetPassword(false);
                    setIsLogin(true);
                    setResetEmail("");
                  }}
                >
                  Quay lại đăng nhập
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
