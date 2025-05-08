import React, { Component } from "react";
import { Box, Typography } from "@mui/material";

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={3} textAlign="center">
          <Typography variant="h6" color="error">
            Đã xảy ra lỗi: {this.state.error?.message || "Không xác định"}
          </Typography>
          <Typography variant="body1">
            Vui lòng làm mới trang hoặc liên hệ hỗ trợ.
          </Typography>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;