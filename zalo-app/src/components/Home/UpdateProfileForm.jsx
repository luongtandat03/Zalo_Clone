import React, { useState } from "react";
import { Box, TextField, Button, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, MenuItem } from "@mui/material";

const UpdateProfileForm = ({ profileData, onSubmit, onCancel }) => {
  const [day, setDay] = useState(profileData?.dateOfBirth?.split("-")[2] || "");
  const [month, setMonth] = useState(profileData?.dateOfBirth?.split("-")[1] || "");
  const [year, setYear] = useState(profileData?.dateOfBirth?.split("-")[0] || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    const formData = new FormData(e.target);
    formData.set("dateOfBirth", formattedDate);
    onSubmit(e, formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          select
          label="Day"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          sx={{ width: "30%" }}
        >
          {[...Array(31)].map((_, i) => (
            <MenuItem key={i + 1} value={String(i + 1)}>{i + 1}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          sx={{ width: "30%" }}
        >
          {[...Array(12)].map((_, i) => (
            <MenuItem key={i + 1} value={String(i + 1).padStart(2, "0")}>{i + 1}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          sx={{ width: "40%" }}
        >
          {[...Array(100)].map((_, i) => {
            const yearValue = String(new Date().getFullYear() - i);
            return <MenuItem key={yearValue} value={yearValue}>{yearValue}</MenuItem>;
          })}
        </TextField>
      </Box>

      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <FormLabel component="legend">Gender</FormLabel>
        <RadioGroup row name="gender" defaultValue={profileData?.gender || ""}>
          <FormControlLabel value="Male" control={<Radio />} label="Male" />
          <FormControlLabel value="Female" control={<Radio />} label="Female" />
          <FormControlLabel value="Other" control={<Radio />} label="Other" />
        </RadioGroup>
      </FormControl>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="contained" color="primary" fullWidth type="submit">
          Save Changes
        </Button>
        <Button variant="outlined" color="primary" fullWidth onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default UpdateProfileForm;