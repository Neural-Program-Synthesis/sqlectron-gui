import * as React from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { useAppDispatch } from '../hooks/redux';
import { setTargetSQL } from '../actions/nl2sql';

export default function FormalQueryList(props) {
  const dispatch = useAppDispatch();
  const handleChange = (ev) => {
    dispatch(setTargetSQL(ev.target.value));
  };

  let count = 0;
  return (
    <FormControl>
      <FormLabel id="demo-radio-buttons-group-label">Formal SQL</FormLabel>
      <RadioGroup
        aria-labelledby="demo-radio-buttons-group-label"
        defaultValue="0"
        name="radio-buttons-group">
        {props.array.map((val) => {
          count = count + 1;
          return (
            <FormControlLabel
              key={count}
              value={val}
              onChange={handleChange}
              control={<Radio />}
              label={val}
            />
          );
        })}
      </RadioGroup>
    </FormControl>
  );
}
