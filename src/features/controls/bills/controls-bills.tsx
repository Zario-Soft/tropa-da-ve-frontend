import ScreenHeader from "src/components/screen-header";
import BillsFilters, { BillsFiltersResult } from "./filters";
import ReportBillsDialog from "./report-bills.modal";
import { ReportContent, ReportContentSummary, ReportContentSummaryItem } from "src/components/report/report.interfaces";
import { useContext, useState } from "react";
import { LoadingContext } from "src/providers/loading.provider";
import moment from "moment";
import ControlsService from "../controls.service";
import { ControlsResponseItem } from "src/contracts";

export default function ControlsBills() {
    const service = new ControlsService();
    const [showFilter, setRefreshFilter] = useState<boolean>(true);
    const [showReport, setShowReport] = useState<boolean>(false);
    const [filter, setFilter] = useState<BillsFiltersResult>();
    const [controlData, setData] = useState<ControlsResponseItem[]>();

    const { setIsLoading } = useContext(LoadingContext);

    const refresh = async () => {
        await setRefreshFilter(false);
        await setRefreshFilter(true);
    }

    const generateData = async (filters: BillsFiltersResult) => {
        try {
            await setIsLoading(true);
            await setFilter(filters);

            const { data } = await service.getByDates(filters);
            if (data) {
                setData(data.items)
            }

            await setShowReport(true);
        }
        finally {
            await setIsLoading(false);
        }
    }

    const internalGenerateReport = (): ReportContent => {

        let localData = controlData!;

        const groupedData = localData
            .slice()
            .sort((a, b) => moment(a.begin, "DD/MM/yyyy").isSameOrBefore(moment(b.begin, "DD/MM/yyyy")) ? -1 : 1)
            .reduce<{ [key: string]: ControlsResponseItem[] }>((group, current) => {
                const key = moment(current.begin, "DD/MM/yyyy").format("MM/yyyy");
                if (group[key])
                    group[key] = [...group[key], current];
                else
                    group[key] = [current];

                return group;
            }, {});

        const summaries = Object.keys(groupedData).map((key) => {

            const summary: ReportContentSummary = {
                items: groupedData[key].map((item) => {
                    const summaryItem: ReportContentSummaryItem = {
                        value: `${item.begin} - ${item.studentName} - ${item.challengeName}${(item.studentPhone ? ` - ${item.studentPhone}` : '')}`
                    }

                    return summaryItem
                }),
                title: `Vencimento em ${key}`,
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
            title="Financeiro"
            onUpdateClick={refresh}
        />
        {showFilter && <BillsFilters
            onButtonClick={generateData}
        />}

        {showReport && <ReportBillsDialog
            onClose={async () => { }}
            onLoadContent={internalGenerateReport}
        />}
    </>
}