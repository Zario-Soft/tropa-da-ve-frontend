import { GridValueFormatterParams } from "@mui/x-data-grid";
import ScreenHeader from "../../components/screen-header";
import { SideBar } from "../../components/sidebar"
import ZGrid, { ZGridColDef } from "../../components/z-grid";
import ControlsService from "./controls.service";
import { useContext, useEffect, useState } from "react";
import { LoadingContext } from "../../providers/loading.provider";
import { toast } from "react-toastify";
import ButtonsLine from "../../components/buttons-line";
import { ControlsResponseItem } from 'src/contracts';
import ControlFilters from "./filters";
import { SearchBoolean, SearchFilters, allItemsBoolean, validItemsBoolean, DurationFilter } from "./controls.interfaces";
import { calculateEndDate, formatDateParam, formatMoneyGrid } from "../../infrastructure/helpers";
import moment from "moment";
import UpsertControlModal from "./upsert-control.modal";
import ConfirmationDialog from "../../components/dialogs/confirmation.dialog";
import ReportControlDialog from "./report-control.modal";
import { ReportContent, ReportContentSummary, ReportContentSummaryItem } from "../../components/report/report.interfaces";
import ControlsBills from "./bills/controls-bills";
import ActiveStudents from "./active-students/active-students";
import { ControlsResponseItemWithEndDate } from "src/contracts/controls";

const columns: ZGridColDef[] = [
    { field: 'challengeId', width: 0, hide: true },
    { field: 'controlId', width: 0, hide: true },
    { field: 'studentId', width: 0, hide: true },
    { field: 'studentName', headerName: 'Aluno', width: 350 },
    { field: 'challengeName', headerName: 'Desafio', width: 190 },
    {
        field: 'begin',
        headerName: 'Início',
        width: 120,
        valueFormatter: formatDateParam,
        filterable: false
    },
    {
        field: 'end',
        headerName: 'Fim',
        width: 120,
        filterable: false
    },
    { field: 'amountPaid', headerName: 'Total Pago', width: 120, valueFormatter: formatMoneyGrid, filterable: false },
    {
        field: 'active',
        headerName: 'Ativo?',
        width: 120,
        valueFormatter: (params: GridValueFormatterParams) => params.value ? "Sim" : "Não", filterable: false
    },
];
const Line = () => <hr style={{ width: '100%', marginTop: '20px' }} />

export default function Controls() {
    let service = new ControlsService();
    const [data, setData] = useState<ControlsResponseItemWithEndDate[]>();
    const [filteredData, setFilteredData] = useState<ControlsResponseItemWithEndDate[]>();
    const [selected, setSelected] = useState<ControlsResponseItem>();
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [upsertDialogOpen, setUpsertDialogOpen] = useState(false);
    const [shouldClearGridSelection, setShouldClearGridSelection] = useState<boolean>();
    const [searchFilters, setSearchFilters] = useState<SearchFilters>();

    const { setIsLoading } = useContext(LoadingContext);

    const getAll = async () => {
        try {
            await setIsLoading(true);

            const { data } = await service.getAll();

            if (data && data.items) {
                const result = data.items.map(control => {
                    return {
                        ...control,
                        end: calculateEndDate(control.challengeType, control.challengeDuration, control.challengeEnd, control.begin)
                    }
                })

                await setData(result);
                await setFilteredData(result);

                await applyFilter(result, searchFilters);
            }
        } catch {
            toast.error('Não foi possivel carregar os dados. Verifique a internet.');
        }
        finally {
            await setIsLoading(false);
        }
    }

    const refresh = async () => {
        await getAll();
        await setSelected(undefined);
    }

    const onExcludeClick = async () => {
        if (!selected) return;

        await setConfirmationDialogOpen(true);
    }

    const onNewClick = async () => {
        await setSelected(undefined);
        await setUpsertDialogOpen(true);
        await setShouldClearGridSelection(!shouldClearGridSelection);
    }

    const onRowDoubleClick = async (e: any) => {
        await setSelected(e);
        await setUpsertDialogOpen(true);
    }

    const onSave = async (control?: ControlsResponseItem) => {
        try {
            if (!isSavingValid(control)) return;

            await setIsLoading(true);

            if (!control?.controlId) {
                await service.new(control!);
                toast.success("Registro criado com sucesso");
            }
            else {
                await service.edit(control!.controlId, control!);
                toast.success("Registro alterado com sucesso");
            }

            await setUpsertDialogOpen(false);
            await refresh();
        } catch (error: any) {
            toast.error(error);
        }
        finally {
            await setIsLoading(false);
        }
    }

    const onConfirmExclusion = async () => {
        if (!selected) return;

        await service.delete(selected.controlId);

        await refresh();

        toast.success("Registro excluído com sucesso");
    }

    useEffect(() => {
        refresh();
        // eslint-disable-next-line
    }, []);

    const isSavingValid = (e?: ControlsResponseItem): boolean => {
        if (!e?.amountPaid || e?.amountPaid <= 0) {
            toast.error("É necessário informar um valor pago.");

            return false;
        }

        if (!e?.challengeId) {
            toast.error("É necessário informar um desafio.");

            return false;
        }

        if (!e?.studentId) {
            toast.error("É necessário informar um aluno.");

            return false;
        }

        return true;
    }

    const onFilterChange = async (filter: SearchFilters) => {
        await setSearchFilters(filter);
        await applyFilter(data, filter);
    }

    const applyFilter = async (items?: ControlsResponseItemWithEndDate[], filter?: SearchFilters) => {
        if (!items || !filter) return;

        let localFiltered = [...items]

        const keys = Object.getOwnPropertyNames(filter)

        keys.forEach((key: string) => {
            const tsKey = key as keyof {}

            const filterField = filter![tsKey];

            if ((typeof filterField) === 'object') {
                localFiltered = tryFilterRange(filterField, tsKey, localFiltered); //from, to
                localFiltered = tryFilterDates(filterField, tsKey, localFiltered); //duration
            } else
                if ((typeof filterField) === 'number') {
                    const validBooleans = validItemsBoolean.map(m => m.value);
                    const validAllPossibleBooleans = allItemsBoolean.map(m => m.value);

                    if (validAllPossibleBooleans.includes((filterField as number))) {
                        if (validBooleans.includes((filterField as number)))
                            localFiltered = localFiltered.filter(user => user[tsKey] === SearchBoolean.TooBoolean(filterField as number))
                    }
                    else
                        localFiltered = localFiltered.filter(user => user[tsKey] === (filterField as number))
                }
        });

        await setFilteredData([...localFiltered])
    }

    const tryFilterRange = (filterField: never, tsKey: never, localFiltered: ControlsResponseItemWithEndDate[])
        : ControlsResponseItemWithEndDate[] => {
        const obj = (filterField as any)

        if (obj.from !== undefined && obj.from !== -1) {
            localFiltered = localFiltered.filter(controls => controls[tsKey] >= obj.from &&
                ((obj.to !== -1 && controls[tsKey] <= obj.to) || (obj.to === undefined || obj.to === -1)))
        }
        else
            if (obj.to !== undefined && obj.to !== -1)
                localFiltered = localFiltered.filter(controls => controls[tsKey] <= obj.to)

        return localFiltered;
    }

    const tryFilterDates = (filterField: any, tsKey: never, localFiltered: ControlsResponseItemWithEndDate[])
        : ControlsResponseItemWithEndDate[] => {
        if (
            !(filterField instanceof DurationFilter)
        ) return localFiltered;

        const durationFilter = (filterField as DurationFilter);

        if (!durationFilter.isValid()) return localFiltered;

        localFiltered = localFiltered.filter(controls => {
            let obj = controls[tsKey];
            if (!obj) {
                const newKey = (tsKey as string).split("_")[0] as keyof {};
                obj = controls[newKey];
            }

            let current = moment(obj, "DD/MM/yyyy");

            return durationFilter.match(current);
        });

        return localFiltered;
    }

    const generateReport = (): ReportContent => {

        let localData = filteredData ?? data ?? [];

        const groupedData = localData
            .slice()
            .sort((a, b) => moment(a.end, "DD/MM/yyyy").isSameOrBefore(moment(b.end, "DD/MM/yyyy")) ? -1 : 1)
            .reduce<{ [key: string]: ControlsResponseItemWithEndDate[] }>((group, current) => {
                const key = moment(current.end, "DD/MM/yyyy").format("MM/yyyy");
                if (group[key])
                    group[key] = [...group[key], current];
                else
                    group[key] = [current];

                return group;
            }, {});

        const summaries = Object.keys(groupedData).map((key) => {

            const summary: ReportContentSummary = {
                items: groupedData[key]
                .sort((a, b) => a.studentName < b.studentName ? -1 : 1)
                .map((item) => {
                    const summaryItem: ReportContentSummaryItem = {
                        value: `${item.end} - ${item.studentName} - ${item.challengeName}${(item.studentPhone ? ` - ${item.studentPhone}` : '')}`
                    }

                    return summaryItem
                }),
                title: `Mês ${key}`,
                breakPage: true,
            }

            return summary;
        })

        return {
            summaries
        }
    }



    return <>
        <div className="page-container">
            <SideBar>
                <div className="page-content">
                    <ScreenHeader
                        title="Controle"
                        onUpdateClick={refresh}
                    />
                    {filteredData && <>
                        <ControlFilters
                            onFilterChange={onFilterChange}
                        />
                        <ZGrid
                            shouldClearSelection={shouldClearGridSelection}
                            rows={filteredData}
                            columns={columns}
                            onRowDoubleClick={async (e: any) => await onRowDoubleClick(e.row)}
                            onRowClick={async (e: any) => await setSelected(e.row)}
                            getRowId={(row: ControlsResponseItem) => row.controlId}
                        />
                        <ButtonsLine
                            onNewClick={onNewClick}
                            onEditClick={() => setUpsertDialogOpen(true)}
                            onExcludeClick={onExcludeClick}
                            excludeEnabled={selected === undefined}
                            editEnabled={selected === undefined}
                            reportVisible={filteredData !== undefined}
                            onReportClick={async () => await setReportDialogOpen(true)}
                        />
                    </>}
                    <Line />
                    <ControlsBills />
                    <Line />
                    <ActiveStudents />
                </div>

            </SideBar >
        </div>
        {upsertDialogOpen && <UpsertControlModal
            current={selected}
            onClose={async () => await setUpsertDialogOpen(false)}
            onSave={onSave}
        />}

        {confirmationDialogOpen && <ConfirmationDialog
            title="Excluir vinculo"
            onConfirm={onConfirmExclusion}
            onClose={() => setConfirmationDialogOpen(false)}
        />}

        {reportDialogOpen && <ReportControlDialog
            onLoadContent={generateReport}
            onClose={async () => await setReportDialogOpen(false)}
        />}
    </>
}