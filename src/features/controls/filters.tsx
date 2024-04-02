import NakedSelect from "../../components/select/naked-select.component"
import { SearchBoolean, SearchFilters, allItemsBoolean } from "./controls.interfaces"
import { useState } from "react"
import NakedSelectDuration from "../../components/select-duration/select-duration.component";

import './controls.css';
import { Duration } from "../challenges/challenges.models";
import SearchComboboxChallenge from "../challenges/searchbox-challenge.component";

interface ControlFiltersProps {
    onFilterChange?: (e: SearchFilters) => void,
}

const Line = () => <div style={{ height: 'auto', display: 'flex', paddingRight: '10px', paddingLeft: '10px' }}>
    <hr />
</div>

export default function ControlFilters(props: ControlFiltersProps) {
    const validMinimum = -1;
    const [current, setCurrent] = useState<SearchFilters>({} as SearchFilters);

    const onDurationChange = async (e: Duration) => {
        //console.log(e);
        if (e.amount >= validMinimum) {
            const local = { ...current!, end: e }
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
        <NakedSelectDuration
            validMinimum={validMinimum}
            id="end-duration-filter"
            label="Vence em"
            name="vence-em-duration"
            onChange={async (e) => await onDurationChange(e)}
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
    </div>
}