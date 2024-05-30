import NakedSelect from "../../components/select/naked-select.component"
import { DurationFilter, SearchBoolean, SearchFilters, allItemsBoolean } from "./controls.interfaces"
import { useState } from "react"
import NakedSelectDuration from "../../components/select-duration/select-duration.component";

import './controls.css';
import { Duration } from "../challenges/challenges.models";
import SearchComboboxChallenge from "../challenges/searchbox-challenge.component";
import { TextField } from "@mui/material";
import moment from "moment";

interface ControlFiltersProps {
    onFilterChange?: (e: SearchFilters) => void,
}

const Line = () => <div style={{ height: 'auto', display: 'flex', paddingRight: '10px', paddingLeft: '10px' }}>
    <hr />
</div>

export default function ControlFilters(props: ControlFiltersProps) {
    const validMinimum = -1;
    const [current, setCurrent] = useState<SearchFilters>({} as SearchFilters);

    const onDurationChange = async (e: moment.Moment) => {
        const local: SearchFilters = { ...current!, vence_em: e }
        await setCurrent(local);
        if (props.onFilterChange)
            await props.onFilterChange(local)
    }

    const onActiveChange = async (e: Duration) => {
        if (e.amount >= validMinimum) {
            const local: SearchFilters = { ...current!, end_inverse: new DurationFilter(true, e, true) }
            await setCurrent(local);

            if (props.onFilterChange)
                await props.onFilterChange(local)
        }
    }

    return <div className="filters">
        <NakedSelect
            sx={{ mb: 2 }}
            id="students-due-select"
            items={allItemsBoolean}
            label="Alunos Ativos"
            name="students-due-label"
            value={current?.active ?? SearchBoolean.Indiferente().value}
            onChange={async (e) => {
                const local = { ...current!, active: e }
                await setCurrent(local);

                if (props.onFilterChange)
                    await props.onFilterChange(local)
            }}
        />
        <Line />
        <TextField
            className='txt-box txt-box-small'
            id="data-inicio-dt"
            label="Vence em"
            type="date"
            variant="outlined"
            value={(current.vence_em ?? moment()).format("yyyy-MM-DD")}
            onChange={async (e) => await onDurationChange(moment(e.target.value, "yyyy-MM-DD"))}
            InputLabelProps={{ shrink: true }}
        />
        <Line />
        <SearchComboboxChallenge
            onSelectedChallengeChanges={async (e) => {
                const local = { ...current!, challengeId: e?.id } as SearchFilters
                await setCurrent(local);

                if (props.onFilterChange)
                    await props.onFilterChange(local)
            }}
        />
        {false && <><Line />
            <NakedSelectDuration
                validMinimum={validMinimum}
                id="active-in-filter"
                label="Ativo em"
                name="active-in-duration"
                onChange={async (e) => await onActiveChange(e)}
            /></>}
    </div>
}