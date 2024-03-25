import NakedSelect from "../../components/select/naked-select.component"
import { SearchFilters, defaultItemsBoolean } from "./controls.interfaces"
import { useState } from "react"
import NakedSelectDuration from "../../components/select-duration/select-duration.component";

import './controls.css';
import { Duration } from "../challenges/challenges.models";

interface ControlFiltersProps {
    onFilterChange?: (e: SearchFilters) => void,
}

export default function ControlFilters(props: ControlFiltersProps) {
    const validMinimum = -1;
    const [current, setCurrent] = useState<SearchFilters>({} as SearchFilters);

    const onDurationChange = async (e: Duration) => {
        console.log(e);
        if (e.amount >= validMinimum) {
            const local = { ...current!, end: e }
            await setCurrent(local);

            if (props.onFilterChange)
                await props.onFilterChange(local)
        }
    }

    return <div className="filters">
        <NakedSelect
            sx={{ mr: 2, mb: 2 }}
            id="students-due-select"
            items={defaultItemsBoolean}
            label="Alunos Ativos"
            name="students-due-label"
            value={current?.active ?? -1}
            onChange={async (e) => {
                const local = { ...current!, active: e }
                await setCurrent(local);

                if (props.onFilterChange)
                    await props.onFilterChange(local)
            }}
        />
        <div style={{ height: 'auto', display: 'flex', paddingRight: '10px' }}>
            <hr />
        </div>
        <NakedSelectDuration
            validMinimum={validMinimum}
            id="end-duration-filter"
            label="Vence em"
            name="vence-em-duration"
            onChange={async (e) => await onDurationChange(e)}
        />
    </div>
}