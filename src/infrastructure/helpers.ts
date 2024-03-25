import { GridValueFormatterParams } from "@mui/x-data-grid";
import moment from "moment";
import { Duration } from "../features/challenges/challenges.models";
import { ChallengeType } from 'src/contracts';

export const formatDateParam = (params: GridValueFormatterParams) : string => {
    return params.value !== '--'
        ? formatDate(params.value)
        : '--';
}

export const formatDate = (value: any): string => {
    //console.log(value);
    const dt = moment(value, "yyyy-MM-DD");
    //console.log(dt);
    return dt.isValid()
        ? dt.format("DD/MM/YYYY")
        : "--"
}

const moneyFormater = Intl.NumberFormat("pt-br", { style: 'currency', currency: 'BRL' })

export const formatMoney = (params: GridValueFormatterParams) => moneyFormater.format(params.value);

export const calculateEndDate = (type: ChallengeType, duration: string, end: Date): string => {
    if (type === "Fixo") return formatDate(end);
    
    const durationObj = Duration.Parse(duration);

    const dueDate = durationObj.addDate(moment());

    return formatDate(dueDate);
}