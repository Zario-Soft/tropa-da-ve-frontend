import moment from "moment";
import { Duration } from "../challenges/challenges.models";

export interface SearchFilters {
    save: boolean,

    vence_em: moment.Moment,
    vence_em_ate: moment.Moment,

    active: number,

    challengeId: number,
}

export class DurationFilter {
    inverse: boolean = false;
    exact: boolean = false;
    duration: Duration;
    constructor(_inverse: boolean, _duration: Duration, _exact: boolean = false) {
        this.inverse = _inverse;
        this.duration = _duration;
        this.exact = _exact;
    }

    isValid(): boolean {
        return this.duration.amount !== undefined && this.duration.amount > 0
    }

    match(date: moment.Moment): boolean {
        const added = this.duration.addDate(moment());

        return date.isSame(added);
    }
}

export class SearchBoolean {
    constructor(public value: number, public label: string) { }

    static Indiferente(): SearchBoolean { return new SearchBoolean(-3, 'Indiferente') }
    static Nao(): SearchBoolean { return new SearchBoolean(-2, 'Não') }
    static Sim(): SearchBoolean { return new SearchBoolean(-1, 'Sim') }

    ToBoolean(): boolean | undefined {
        return SearchBoolean.TooBoolean(this.value);
    }

    static TooBoolean(i: number): boolean | undefined {
        if (i === -3) return undefined;

        return i === -1
    }
}

export const validItemsBoolean = [
    SearchBoolean.Sim(),
    SearchBoolean.Nao(),
]

export const allItemsBoolean = [
    SearchBoolean.Indiferente(),
    ...validItemsBoolean
]

export interface Range<Field, Input> {
    from: Field;
    to: Field;
    compare: (input: Input) => boolean
}

export class DateRange implements Range<number, string> {
    compare(input: string): boolean {

        const current = moment(input, "yyyy-MM-DD");
        //console.log(current);
        const from = this.from !== -1 ? current.add(this.from, 'months') : undefined;
        const to = this.to !== -1 ? current.add(this.to, 'months') : undefined;

        return (!!from || current.isSameOrAfter(from)) && (!!to || current.isSameOrBefore(to));
    }

    constructor(
        readonly from: number,
        readonly to: number,
    ) { }

}

export class NumberRange implements Range<number, number> {
    constructor(
        readonly from: number,
        readonly to: number,
    ) { }

    compare(input: number): boolean {
        return (this.from !== -1 || input >= this.from) && (this.to !== -1 || input <= this.to);
    }
}