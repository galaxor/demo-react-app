import { useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import MuiInput from '@mui/material/Input';

const Input = styled(MuiInput)`
  width: 42px;
`;

export default function InputSlider({id, name, min, max, value, setValue, label, size, step, shiftStep}) {
  const handleSliderChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleInputChange = (event) => {
    setValue(event.target.value === '' ? 0 : Number(event.target.value));
  };

  const handleBlur = () => {
    if (value < min) {
      setValue(min);
    } else if (value > max) {
      setValue(max);
    }
  };

  return (
    <Box sx={{ width: 250 }}>
      <Typography id={id+'-label'} gutterBottom>
        {label}
      </Typography>
      <Grid container spacing={2} sx={{ alignItems: 'center' }}>
        <Grid item xs>
          <Slider
            value={typeof value === 'number' ? value : min}
            onChange={handleSliderChange}
            aria-labelledby={id+'-label'}
            step={step}
            shiftStep={shiftStep}
            min={min}
            max={max}
          />
        </Grid>
        <Grid item>
          <Input
            name={name}
            value={value}
            size={size? size : 'medium'}
            onChange={handleInputChange}
            onBlur={handleBlur}
            inputProps={{
              step: step,
              type: 'number',
              'aria-labelledby': id+'-label',
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
