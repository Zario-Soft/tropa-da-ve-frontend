import NakedSelect from "../../components/select/naked-select.component"
import { DurationFilter, SearchBoolean, SearchFilters, allItemsBoolean } from "./controls.interfaces"
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
        if (e.amount >= validMinimum) {
            const local: SearchFilters = { ...current!, end: new DurationFilter(false, e) }
            await setCurrent(local);

            if (props.onFilterChange)
                await props.onFilterChange(local)
        }
    }

    const onActiveChange = async (e: Duration) => {
        console.log(e);
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