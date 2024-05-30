import { TextField } from "@mui/material";
import moment from "moment";
import { useState } from "react";
import { GreenButton } from "src/components/buttons";

interface BillsFiltersProps {
    onButtonClick: (e: BillFiltersDateResult) => Promise<void>,
}

export interface BillsFiltersResult {
    monthFrom: number,
    yearFrom: number,
    monthTo: number,
    yearTo: number
}

export interface BillFiltersDateResult {
    from: Date,
    to: Date,
}

export default function BillsFilters({ onButtonClick }: BillsFiltersProps) {
    const defaultValue: BillFiltersDateResult = {
        from: moment().format("yyyy-MM-DD") as unknown as Date,
        to: moment().format("yyyy-MM-DD") as unknown as Date
    }

    const [current, setCurrent] = useState<BillFiltersDateResult>(defaultValue);

    return <div style={{
        display: 'flex',
        gap: '20px',
        alignItems: 'center'
    }}>
        <TextField
            className='txt-box txt-box-small'
            id="data-inicio-dt"
            label="Inicio"
            type="date"
            variant="outlined"
            value={current.from}
            onChange={(e: any) => {
                const local: BillFiltersDateResult = { ...current, from: moment(e.target.value).format("yyyy-MM-DD") as unknown as Date }

                setCurrent(local);
            }}
            InputLabelProps={{ shrink: true }}
        />
        <p>Até</p>
        <TextField
            className='txt-box txt-box-small'
            id="data-fim-dt"
            label="Fim"
            type="date"
            variant="outlined"
            value={current.to}
            onChange={(e: any) => {
                const local: BillFiltersDateResult = { ...current, to: moment(e.target.value).format("yyyy-MM-DD") as unknown as Date }

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