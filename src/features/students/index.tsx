import ScreenHeader from "../../components/screen-header";
import { SideBar } from "../../components/sidebar"
import ZGrid, { ZGridColDef } from "../../components/z-grid";
import StudentsService from "./students.service";
import { StudentsResponseItem } from 'src/contracts';
import { useContext, useEffect, useState } from "react";
import { LoadingContext } from "../../providers/loading.provider";
import { toast } from "react-toastify";
import ConfirmationDialog from "../../components/dialogs/confirmation.dialog";
import ButtonsLine from "../../components/buttons-line";
import UpsertModalStudent, { UpsertStudentResponse } from "./upsert-student.modal";
import ControlsService from "../controls/controls.service";
import { formatDateUnknown } from "src/infrastructure/helpers";

const columns: ZGridColDef[] = [
    { field: 'id', width: 0, hide: true },
    { field: 'name', headerName: 'Nome', width: 290 },
    { field: 'age', headerName: 'Idade', width: 60 },
    { field: 'telephone', headerName: 'Telefone', width: 120 },
    { field: 'email', headerName: 'E-mail', width: 170 },
    { field: 'city', headerName: 'Cidade', width: 120 },
    { field: 'challengeName', headerName: 'Desafio', width: 190 },
];

export default function Students() {
    const studentService = new StudentsService();
    const controlsService = new ControlsService();

    const [data, setData] = useState<StudentsResponseItem[]>();
    const [selected, setSelected] = useState<StudentsResponseItem>();
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const [upsertDialogOpen, setUpsertDialogOpen] = useState(false);
    const [shouldClearGridSelection, setShouldClearGridSelection] = useState<boolean>();

    const { setIsLoading } = useContext(LoadingContext);

    const getAll = async () => {
        try {
            await setIsLoading(true);

            const { data } = await studentService.getAll();

            if (data && data.items) {
                const ordered = data.items
                .slice()
                .sort((a, b) => a.name < b.name ? -1 : 1);
                await setData(ordered);
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

    const onConfirmExclusion = async () => {
        if (!selected) return;

        await studentService.delete(selected.id);

        await refresh();

        toast.success("Registro excluído com sucesso");
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

    const onSave = async (response: UpsertStudentResponse) => {
        try {
            if (!isSavingValid(response)) return;

            await setIsLoading(true);
            let studentId: number;

            if (!response.student.id) {
                
                studentService.new(response.student)
                .then((result: any) => upsertControls(response, result.data));

                toast.success("Registro criado com sucesso");
            }
            else {
                await studentService.edit(response.student);
                studentId = response.student.id;

                await upsertControls(response, studentId);

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

    const upsertControls = async (response: UpsertStudentResponse, studentId: number) => {        
        if (response.challenge) {
            const begin = formatDateUnknown(response.challenge!.begin ?? new Date());

            if (!response.control?.controlId) {
                await controlsService.new({
                    challengeId: response.challenge.id,
                    studentId,
                    active: true,
                    amountPaid: response.challenge!.price,
                    begin
                })
            }
            else {
                await controlsService.edit(
                    response.control.controlId,
                    {
                        challengeId: response.challenge.id,
                        studentId,
                        active: true,
                        amountPaid: response.control.amountPaid,
                        begin 
                    })
            }
        }
    }

    const isSavingValid = (response: UpsertStudentResponse): boolean => {
        const { student } = response;
        if (!student.name) {
            toast.error("É necessário informar um nome para o aluno.");

            return false;
        }

        return true;
    }

    useEffect(() => {
        refresh();
        // eslint-disable-next-line
    }, []);

    return <>
        <div className="page-container">
            <SideBar>
                <div className="page-content">
                    <ScreenHeader
                        title="Alunos"
                        onUpdateClick={refresh}
                    />
                    {data && <>
                        <ZGrid
                            shouldClearSelection={shouldClearGridSelection}
                            rows={data}
                            columns={columns}
                            onRowDoubleClick={async (e: any) => await onRowDoubleClick(e.row)}
                            onRowClick={async (e: any) => await setSelected(e.row)}
                        />
                        <ButtonsLine
                            onNewClick={onNewClick}
                            onEditClick={() => setUpsertDialogOpen(true)}
                            onExcludeClick={onExcludeClick}
                            excludeEnabled={selected === undefined}
                            editEnabled={selected === undefined}
                        />
                    </>}
                </div>
            </SideBar>
        </div>
        {confirmationDialogOpen && <ConfirmationDialog
            title="Excluir aluno"
            onConfirm={onConfirmExclusion}
            onClose={() => setConfirmationDialogOpen(false)}
        />}

        {upsertDialogOpen && <UpsertModalStudent
            current={selected}
            onClose={() => setUpsertDialogOpen(false)}
            onSave={onSave}
        />}
    </>

}