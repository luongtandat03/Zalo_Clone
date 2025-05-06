import React from 'react';
import { TextField, Box } from '@mui/material';

const SearchBar = ({ placeholder, onSearch }) => {
  const handleChange = (event) => {
    const value = event.target.value;
    onSearch(value);
  };

  return (
    <Box sx={{ p: 2 }}>
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        placeholder={placeholder}
        onChange={handleChange}
        sx={{ bgcolor: 'background.paper' }}
      />
    </Box>
  );
};

export default SearchBar;