import moment from "moment";
import { Duration } from "../challenges/challenges.models";

export interface SearchFilters {
    save: boolean,

    end: Duration,

    active: number,
}

export const defaultItemsBoolean = [
    { value: -1, label: 'Indiferente' },
    { value: 0, label: 'Não' },
    { value: 1, label: 'Sim' },
]

export interface Range<Field, Input> {
    from: Field;
    to: Field;
    compare: (input: Input) => boolean
}

export class DateRange implements Range<number, string> {
    compare(input: string): boolean {
       
        const current = moment(input, "yyyy-MM-DD");
        console.log(current);
        const from = this.from !== -1 ? current.add(this.from, 'months') : undefined;
        const to = this.to !== -1 ? current.add(this.to, 'months') : undefined;

        return (!!from || current.isSameOrAfter(from)) && (!!to || current.isSameOrBefore(to)); 
    }

    constructor(
        readonly from: number,
        readonly to: number,
        ) {}

}

export class NumberRange implements Range<number, number> {
    constructor(
        readonly from: number,
        readonly to: number,
        ) {}

        compare(input: number): boolean {   
            return (this.from !== -1 || input >= this.from) && (this.to !== -1 || input <= this.to);   
        }
}