import moment from "moment";

export type DurationType = 'Dias' | 'Meses';

export class Duration {
    amount: number;
    type: DurationType;

    constructor(amount: number, type: DurationType) {
        this.amount = amount;
        this.type = type;
    }

    toString(): string {
        return `${this.amount} ${this.type}`
    }

    isValid(minimum?: number): boolean {
        return this.amount >= (minimum ?? 0);
    }

    static Parse(input: string): Duration {
        if (input) {
            const inputSplit = input.split(' ');

            return new Duration(parseInt(inputSplit[0]), inputSplit[1] as DurationType);
        }

        return new Duration(1, 'Meses');
    }

    addDate(input: moment.Moment): moment.Moment {
        const result = input.clone().add(this.amount, this.type === "Dias" ? 'days' : 'months');
        return result;
    }
}
