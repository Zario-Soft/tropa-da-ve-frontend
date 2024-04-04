import ScreenHeader from "../../components/screen-header";
import { SideBar } from "../../components/sidebar"
import ZGrid, { ZGridColDef } from "../../components/z-grid";
import ChallengesService from "./challenges.service";
import { useContext, useEffect, useState } from "react";
import { LoadingContext } from "../../providers/loading.provider";
import { ChallengesResponseItem } from 'src/contracts';
import ButtonsLine from "../../components/buttons-line";
import { toast } from "react-toastify";
import ConfirmationDialog from "../../components/dialogs/confirmation.dialog";
import UpsertModalChallenge from "./upsert-challenge.modal";
import { formatDateParam, formatMoneyGrid } from "../../infrastructure/helpers";


const columns: ZGridColDef[] = [
    { field: 'id', width: 0, hide: true },
    { field: 'name', headerName: 'Nome', width: 190 },
    { field: 'description', headerName: 'Descrição', width: 150, hide: true },
    { field: 'type', headerName: 'Tipo', width: 90 },
    {
        field: 'begin',
        headerName: 'Início',
        width: 120,
        valueFormatter: formatDateParam
    },
    { field: 'end', headerName: 'Fim', width: 120, valueFormatter: formatDateParam },
    { field: 'duration', headerName: 'Tempo', width: 120 },
    { field: 'price', headerName: 'Preço', width: 120, valueFormatter: formatMoneyGrid },
];

export default function Challenges() {
    let service = new ChallengesService();

    const [data, setData] = useState<ChallengesResponseItem[]>();
    const [selected, setSelected] = useState<ChallengesResponseItem>();
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const [upsertDialogOpen, setUpsertDialogOpen] = useState(false);
    const [shouldClearGridSelection, setShouldClearGridSelection] = useState<boolean>();

    const { setIsLoading } = useContext(LoadingContext);

    const getAll = async () => {
        try {
            await setIsLoading(true);

            const { data } = await service.getAll();

            if (data && data.items) {                
                await setData(data.items);
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

        await service.delete(selected.id);

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

    const onSave = async (challenge: ChallengesResponseItem) => {
        try {
            if (!isSavingValid(challenge)) return;
            
            await setIsLoading(true);

            if (!challenge.id) {
                await service.new(challenge);
                toast.success("Desafio criado com sucesso");
            }
            else {
                await service.edit(challenge);
                toast.success("Desafio alterado com sucesso");
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

    useEffect(() => {
        refresh();
        // eslint-disable-next-line
    }, []);

    const isSavingValid = (e: ChallengesResponseItem) : boolean => {
        if (!e.name) {
            toast.error("É necessário informar um nome para o desafio.");
            
            return false;
        }

        if (!e.type) {
            toast.error("É necessário informar um tipo para o desafio.");
            
            return false;
        }

        if (!e.price || e.price === 0) {
            toast.error("É necessário informar um preço para o desafio.");
            
            return false;
        }

        if (e.type === "Fixo" && (!e.begin || !e.end)) {
            toast.error("É necessário informar as datas do desafio fixo.");
            
            return false;
        }

        if (e.type === "Variavel" && (!e.duration)) {
            toast.error("É necessário informar o intervalo do desafio variável.");
            
            return false;
        }
        
        return true;
    }

    return <>
        <div className="page-container">
            <SideBar>
                <div className="page-content">
                    <ScreenHeader
                        title="Desafios"
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
            title="Excluir desafio"
            onConfirm={onConfirmExclusion}
            onClose={() => setConfirmationDialogOpen(false)}
        />}
        {upsertDialogOpen && <UpsertModalChallenge
            current={selected}
            onClose={() => setUpsertDialogOpen(false)}
            onSave={onSave}
        />}
    </>
}