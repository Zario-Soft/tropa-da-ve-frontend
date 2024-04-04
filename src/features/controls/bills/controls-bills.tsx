import ScreenHeader from "src/components/screen-header";
import BillsFilters, { BillsFiltersResult } from "./filters";
import ReportBillsDialog from "./report-bills.modal";
import { ReportContent, ReportContentSummary, ReportContentSummaryItem } from "src/components/report/report.interfaces";
import { useContext, useState } from "react";
import { LoadingContext } from "src/providers/loading.provider";
import moment from "moment";
import ControlsService from "../controls.service";
import { ControlsResponseItem } from "src/contracts";
import { formatMoney } from "src/infrastructure/helpers";

export default function ControlsBills() {
    const service = new ControlsService();
    const [showFilter, setRefreshFilter] = useState<boolean>(true);
    const [showReport, setShowReport] = useState<boolean>(false);
    const [controlData, setData] = useState<ControlsResponseItem[]>();

    const { setIsLoading } = useContext(LoadingContext);

    const refresh = async () => {
        await setRefreshFilter(false);
        await setRefreshFilter(true);
    }

    const generateData = async (filters: BillsFiltersResult) => {
        try {
            await setIsLoading(true);

            const { data } = await service.getByDates(filters);
            if (data) {
                await setData(data.items)
                await setShowReport(true);
            }
        }
        finally {
            await setIsLoading(false);
        }
    }

    const internalGenerateReport = (): ReportContent => {

        let localData: ControlsResponseItem[] = controlData ?? [];

        const groupedData = localData
            .slice()
            .sort((a, b) => moment(a.begin, "DD/MM/yyyy").isSameOrBefore(moment(b.begin, "DD/MM/yyyy")) ? -1 : 1)
            .reduce<{ [key: string]: Record<string, number> }>((group, current) => {
                const key = moment(current.begin, "yyyy-MM-DD").format("MM/yyyy");
                
                if (group[key]) {
                    if (group[key][current.challengeName]) {
                        group[key][current.challengeName] += current.amountPaid;
                    }
                    else {
                        group[key][current.challengeName] = current.amountPaid;
                    }
                }
                else {
                    group[key] = {};
                    group[key][current.challengeName] = current.amountPaid;
                }

                return group;
            }, {});

        const summaries = Object.keys(groupedData).map((key) => {

            const summaryItems = Object.keys(groupedData[key]).map((mk) => {
                    
                    
                const summaryItem: ReportContentSummaryItem = {
                    value: `${mk} - ${formatMoney(groupedData[key][mk])}`
                }

                return summaryItem;
            });

            const total = Object.keys(groupedData[key])
            .map((mk) => groupedData[key][mk])
            .reduce((prev, curr) => prev += curr, 0);
            
            const summary: ReportContentSummary = {
                items: summaryItems,
                title: `Valores pagos em ${key} (Total: ${formatMoney(total)})`,
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
            onClose={async () => await setShowReport(false)}
            onLoadContent={internalGenerateReport}
        />}
    </>
}