import ScreenHeader from "src/components/screen-header";
import ActiveStudentsFilters, { ActiveStudentsDateResult, DefaultActiveStudentsResultValue } from "./filters";
import { ReportContent, ReportContentSummary, ReportContentSummaryItem } from "src/components/report/report.interfaces";
import { useContext, useState } from "react";
import { LoadingContext } from "src/providers/loading.provider";
import moment from "moment";
import ControlsService from "../controls.service";
import { ControlsResponseItem } from "src/contracts";
import ReportActiveStudentsDialog from "./report-active-students.modal";

export default function ActiveStudents() {
    const service = new ControlsService();
    const [showFilter, setRefreshFilter] = useState<boolean>(true);
    const [filters, setFilters] = useState<ActiveStudentsDateResult>(DefaultActiveStudentsResultValue);
    const [showReport, setShowReport] = useState<boolean>(false);
    const [controlData, setData] = useState<ControlsResponseItem[]>();

    const [reportTitle, setReportTitle] = useState<string>();

    const { setIsLoading } = useContext(LoadingContext);

    const refresh = async () => {
        await setRefreshFilter(false);
        await setRefreshFilter(true);
    }

    const generateData = async (filters: ActiveStudentsDateResult) => {
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

        let localData: ControlsResponseItem[] = controlData ?? [];
        setReportTitle(`Alunas Ativas ${moment(filters.from).format("DD/MM/YYYY")} - ${moment(filters.to).format("DD/MM/YYYY")}`);

        //filter by specific dates
        // localData = localData
        // .slice()
        // .filter(student => moment(student.begin, "yyyy-MM-DD").isSameOrBefore(moment(filters.from, "yyyy-MM-DD")) && 
        //                    moment(student.end, "yyyy-MM-DD").isSameOrAfter(moment(filters.to, "yyyy-MM-DD")));


        const range = getRange(moment(filters.from), moment(filters.to));
        
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
            .filter(a => moment(currDate, "yyyy-MM-DD").isBetween(moment(a.begin, "yyyy-MM-DD").startOf('month'), moment(a.end, "yyyy-MM-DD").endOf('month')));

                group[currDate] = [...group[currDate], ...filtered];
        });

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
            title={reportTitle}
            onClose={async () => await setShowReport(false)}
            onLoadContent={internalGenerateReport}
        />}
    </>
}