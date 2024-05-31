import { TextField } from "@mui/material";
import moment from "moment";
import { useState } from "react";
import { GreenButton } from "src/components/buttons";

interface ActiveStudentsProps {
    onButtonClick: (e: ActiveStudentsDateResult) => Promise<void>,
}

export interface ActiveStudentsResult {
    monthFrom: number,
    yearFrom: number,
    monthTo: number,
    yearTo: number
}

export interface ActiveStudentsDateResult {
    from: Date,
    to: Date,
}

export const DefaultActiveStudentsResultValue: ActiveStudentsDateResult = {
    from: moment().format("yyyy-MM-DD") as unknown as Date,
    to: moment().format("yyyy-MM-DD") as unknown as Date
}

export default function ActiveStudentsFilters({ onButtonClick }: ActiveStudentsProps) {
    const [current, setCurrent] = useState<ActiveStudentsDateResult>(DefaultActiveStudentsResultValue);

    return <div style={{
        display: 'flex',
        gap: '20px',
        alignItems: 'center'
    }}>
        <TextField
            className='txt-box txt-box-small'
            id="acs-data-inicio-dt"
            label="Inicio"
            type="date"
            variant="outlined"
            value={current.from}
            onChange={(e: any) => {
                const local: ActiveStudentsDateResult = { ...current, from: moment(e.target.value).format("yyyy-MM-DD") as unknown as Date }

                setCurrent(local);
            }}
            InputLabelProps={{ shrink: true }}
        />
        <p>Até</p>
        <TextField
            className='txt-box txt-box-small'
            id="acs-data-fim-dt"
            label="Fim"
            type="date"
            variant="outlined"
            value={current.to}
            onChange={(e: any) => {
                const local: ActiveStudentsDateResult = { ...current, to: moment(e.target.value).format("yyyy-MM-DD") as unknown as Date }

                setCurrent(local);
            }}
            InputLabelProps={{ shrink: true }}
        />
        <GreenButton
        onClick={async () => await onButtonClick(current)}
        style={{
            height: '30px'
        }}
        >
            Relatório
        </GreenButton>
    </div>
}