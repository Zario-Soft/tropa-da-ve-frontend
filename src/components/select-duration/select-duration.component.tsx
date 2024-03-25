import Box from '@mui/material/Box';
import NativeSelect from '@mui/material/NativeSelect';
import { SxProps, TextField, Theme, Typography } from '@mui/material';
import { Duration, DurationType } from '../../features/challenges/challenges.models';
import { useState } from 'react';

interface NakedSelectDurationProps {
    id: string,
    name: string,
    label: string,
    validMinimum?:number,
    sx?: SxProps<Theme>,
    onChange: (item: Duration) => Promise<any>
}

export default function NakedSelectDuration(props: NakedSelectDurationProps) {
    const [value, setValue] = useState<Duration>(new Duration(-1, 'Dias'));

    return (
        <Box style={{
            marginTop: '-3px'
        }}>
            <Typography id={`label-${props.id}`}
                gutterBottom
                sx={{
                    fontSize: '13px',
                    fontWeight: '400',
                    color: 'rgba(0, 0, 0, 0.6)',
                    mb: 2
                }}>
                {props.label}
            </Typography>

            <Box sx={{
                display: 'flex'
            }}>
                <Box sx={{
                    mr: 3,
                    mt: -2
                }}>
                    <TextField
                        id="standard-basic"
                        variant="standard"
                        type='number'
                        value={value?.amount}
                        onChange={async (e) => {
                            const newValue = new Duration(Number(e.target.value), value.type);
                            if (newValue.isValid(props.validMinimum)) {
                                await setValue(newValue);

                                props.onChange(newValue);
                            }                            
                        }}
                    />
                </Box>

                <Box
                    sx={{
                        mt: -2
                    }}
                >
                    <NativeSelect
                        inputProps={{
                            name: props.name,
                            id: props.id,
                        }}
                        sx={{ ...props.sx! }}
                        value={value ? value.type : 'Dias'}
                        onChange={async (e) => {
                            const newValue = new Duration(value.amount, e.target.value as DurationType);

                            await setValue(newValue);

                            props.onChange(newValue);
                        }}
                    >
                        <option value={'Dias'}>Dias</option>
                        <option value={'Meses'}>Meses</option>
                    </NativeSelect>
                </Box>
            </Box>
        </Box>
    );
}