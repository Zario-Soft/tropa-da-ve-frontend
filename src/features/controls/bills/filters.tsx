import { FormControl, InputLabel, Select, TextField } from "@mui/material";
import { useState } from "react";
import { GreenButton } from "src/components/buttons";

interface BillsFiltersProps {
    onButtonClick: (e: BillsFiltersResult) => Promise<void>,
}

export interface BillsFiltersResult {
    monthFrom: number,
    yearFrom: number,
    monthTo: number,
    yearTo: number
}

export default function BillsFilters({ onButtonClick }: BillsFiltersProps) {
    const months = Array.from({ length: 12 }, (_, monthNumber) => {
        const date = new Date(0, monthNumber);
        const year = date.toLocaleDateString('pt-BR', { month: "long" });
        return year.substring(0, 1).toUpperCase() + year.substring(1, year.length)
    })

    const defaultValue: BillsFiltersResult = {
        monthFrom: new Date().getMonth() + 1,
        monthTo: new Date().getMonth() + 1,
        yearFrom: new Date().getFullYear(),
        yearTo: new Date().getFullYear(),
    }

    const [current, setCurrent] = useState<BillsFiltersResult>(defaultValue);

    return <div style={{
        display: 'flex',
        gap: '20px',
        alignItems: 'center'
    }}>
        <FormControl variant="outlined" className="general-input form-control txt-box-small">
            <InputLabel shrink>Mês Início</InputLabel>
            <Select
                native
                label="month-from"
                value={current?.monthFrom}
                onChange={(e: any) => {
                    const local: BillsFiltersResult = {...current, monthFrom: parseInt(e.target.value)}

                    setCurrent(local);
                }}
            >
                {months.map((month, value) => <option value={value + 1}>{month}</option>)}
            </Select>
        </FormControl>

        <TextField
            id="valor"
            className='txt-box txt-box-small'
            label="Ano Início"
            variant="outlined"
            type="number"
            value={current?.yearFrom}
            onChange={(e: any) => {
                const local: BillsFiltersResult = {...current, yearFrom: parseInt(e.target.value)}

                setCurrent(local);
            }}
            InputLabelProps={{ shrink: true }}
        />
        <p>Até</p>
        <FormControl variant="outlined" className="general-input form-control txt-box-small">
            <InputLabel shrink>Mês Fim</InputLabel>
            <Select
                native
                label="Tipo"
                value={current?.monthTo}
                onChange={(e: any) => {
                    const local: BillsFiltersResult = {...current, monthTo: parseInt(e.target.value)}

                    setCurrent(local);
                }}
            >
                {months.map((month, value) => <option value={value + 1}>{month}</option>)}
            </Select>
        </FormControl>

        <TextField
            id="valor"
            className='txt-box txt-box-small'
            label="Ano Fim"
            variant="outlined"
            type="number"
            value={current?.yearTo}
            onChange={(e: any) => {
                const local: BillsFiltersResult = {...current, yearTo: parseInt(e.target.value)}

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