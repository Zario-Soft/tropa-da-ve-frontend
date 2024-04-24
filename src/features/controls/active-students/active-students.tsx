import ScreenHeader from "src/components/screen-header";
import ActiveStudentsFilters, { ActiveStudentsResult, DefaultActiveStudentsResultValue } from "./filters";
import { ReportContent, ReportContentSummary, ReportContentSummaryItem } from "src/components/report/report.interfaces";
import { useContext, useState } from "react";
import { LoadingContext } from "src/providers/loading.provider";
import moment from "moment";
import ControlsService from "../controls.service";
import { ControlsResponseItem } from "src/contracts";
import ReportActiveStudentsDialog from "./report-active-students.modal";
import { ControlsResponseItemWithEndDate } from "src/contracts/controls";

export default function ActiveStudents() {
    const service = new ControlsService();
    const [showFilter, setRefreshFilter] = useState<boolean>(true);
    const [filters, setFilters] = useState<ActiveStudentsResult>(DefaultActiveStudentsResultValue);
    const [showReport, setShowReport] = useState<boolean>(false);
    const [controlData, setData] = useState<ControlsResponseItemWithEndDate[]>();

    const { setIsLoading } = useContext(LoadingContext);

    const refresh = async () => {
        await setRefreshFilter(false);
        await setRefreshFilter(true);
    }

    const generateData = async (filters: ActiveStudentsResult) => {
        try {
            await setIsLoading(true);
            await setFilters(filters);
            const { data } = await service.getByExpiryDates(filters);
            if (data) {
                await setData(data.items)
                await setShowReport(true);
            }
        }
        finally {
            await setIsLoading(false);
        }
    }

    function getRange(startDate: moment.Moment, endDate: moment.Moment) {
        let diff = endDate.diff(startDate, 'month')
        let range: moment.Moment[] = []
        for (let i = 0; i <= diff; i++) {
            range.push(startDate.clone().add(i, 'month'))
        }
        return range
    }

    const internalGenerateReport = (): ReportContent => {

        let localData: ControlsResponseItemWithEndDate[] = controlData ?? [];

        const from = moment(`${filters.yearFrom}${String(filters.monthFrom).padStart(2, '0')}01`, "YYYYMMDD");
        console.log(from);
        const to = moment(`${filters.yearTo}${String(filters.monthTo).padStart(2, '0')}28`, "YYYYMMDD").endOf('month');
        console.log(to);

        const range = getRange(from, to);
        //console.log(range);
        
        let group: Record<string, ControlsResponseItem[]> = {};
        
        range
        .slice()
        .map<{ [key: string]: ControlsResponseItem[] }>((date) => {
            const key = moment(date, "yyyy-MM-DD").endOf('month').format("yyyy-MM-DD");
            group[key] = [];

            return group;

        });

        Object.keys(group).forEach((currDate: string) => {
            const filtered = localData
            .slice()
            .filter(a => moment(currDate, "yyyy-MM-DD").isBetween(moment(a.begin, "yyyy-MM-DD"), moment(a.end, "yyyy-MM-DD")));

                group[currDate] = [...group[currDate], ...filtered];
        });

        //console.log(r)
        console.log(localData)
        console.log(group)

        const summaries = Object.keys(group)
        .filter(key => group[key].length > 0)        
        .map((key) => {
            const summary: ReportContentSummary = {
                items: group[key]
                    .sort((a, b) => a.studentName < b.studentName ? -1 : 1)
                    .map((item) => {
                        const summaryItem: ReportContentSummaryItem = {
                            value: `${item.studentName} - ${item.challengeName}${(item.studentPhone ? ` - ${item.studentPhone}` : '')}`
                        }

                        return summaryItem
                    }),
                title: `Alunas ativas em ${moment(key, "yyyy-MM-DD").format("MM/yyyy")}`,
                breakPage: true,
            }

            return summary;
        })

        return {
            summaries
        }
    }

    return <>
        <ScreenHeader
            title="Alunos Ativos"
            onUpdateClick={refresh}
        />
        {showFilter && <ActiveStudentsFilters
            onButtonClick={generateData}
        />}

        {showReport && <ReportActiveStudentsDialog
            onClose={async () => await setShowReport(false)}
            onLoadContent={internalGenerateReport}
        />}
    </>
}