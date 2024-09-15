import { ChallengesResponseItem, ControlsResponseItem, StudentsResponseItem } from 'src/contracts'
import { useContext, useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Checkbox, FormControlLabel } from "@mui/material";
import { NormalButton, WarningButton } from "../../components/buttons";
import SearchCombobox from "../../components/combobox/search-combo";
import { PaperComponent } from "../../components/dialogs";
import StudentsService from "../students/students.service";
import ChallengesService from "../challenges/challenges.service";
import { LoadingContext } from "../../providers/loading.provider";
import { toast } from "react-toastify";
import './controls.css';
import '../../index.css';
import moment from "moment";
import { formatDateUnknown } from 'src/infrastructure/helpers';

interface UpsertControlModalProps {
    current?: ControlsResponseItem,
    onClose: () => Promise<void>,
    onSave: (e?: ControlsResponseItem) => Promise<void>,
}

export default function UpsertControlModal(props: UpsertControlModalProps) {
    const studentsService = new StudentsService();
    const challengeService = new ChallengesService();

    const { setIsLoading } = useContext(LoadingContext);

    const [current, setCurrent] = useState(
        props.current ?
            {
                ...props.current,
                begin: formatDateUnknown(props.current.begin)
            } as ControlsResponseItem :
            {
                begin: formatDateUnknown(new Date())
            } as ControlsResponseItem);

    const [challenges, setChallenges] = useState<ChallengesResponseItem[]>([]);
    const [selectedChallenge, setSelectedChallenge] = useState<ChallengesResponseItem | undefined>();
    const [students, setStudents] = useState<StudentsResponseItem[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<StudentsResponseItem | undefined>();

    const isNew = current.active === undefined;

    const loadInfo = async () => {
        await loadChallenges();
        await loadStudents();
    }

    const loadChallenges = async () => {
        try {
            await setIsLoading(true);

            const { data } = await challengeService.getAll();

            if (data && data.items) {
                await setChallenges(data.items);

                return data.items;
            }
        } catch {
            toast.error('Não foi possivel carregar os dados. Verifique a internet.');
        }
        finally {
            await setIsLoading(false);
        }
    }

    const loadStudents = async () => {
        try {
            await setIsLoading(true);

            const { data } = await studentsService.getAll();

            if (data && data.items) {
                await setStudents(data.items);

                return data.items;
            }
        } catch {
            toast.error('Não foi possivel carregar os dados. Verifique a internet.');
        }
        finally {
            await setIsLoading(false);
        }
    }

    const onAfterChallengeSelectLoaded = async (challenges?: ChallengesResponseItem[]): Promise<ChallengesResponseItem | undefined> => {
        const challeng = challenges?.find(f => f.id === current?.challengeId);
        await onSelectedChallengeChanges(challeng);
        return challeng;
    };

    const onSelectedChallengeChanges = async (e?: ChallengesResponseItem) => {
        const challengeType = e?.type ?? 'Fixo';
        
        if (isNew) {
            setCurrent({
                ...current,
                amountPaid: e?.price ?? 0,
                begin: e?.begin ?? formatDateUnknown(new Date()),
                challengeType: challengeType
            });
        }

        await setSelectedChallenge(e);
    }

    const onAfterStudentSelectLoaded = async (students?: StudentsResponseItem[]): Promise<StudentsResponseItem | undefined> => {
        const st = students?.find(f => f.id === current?.studentId);

        await setSelectedStudent(st);

        return st;
    }

    const onSave = async () => {
        await props.onSave(
            {
                ...current,
                studentId: selectedStudent?.id!,
                challengeId: selectedChallenge?.id!,
            });
    }

    useEffect(() => { loadInfo() },
        // eslint-disable-next-line
        []);

    return <>
        <Dialog
            open
            maxWidth="lg"
            fullWidth
            aria-labelledby="draggable-dialog-title"
            PaperComponent={PaperComponent}
        >
            <DialogTitle id="draggable-dialog-title" style={{ cursor: 'move' }}>
                {isNew ? 'Novo' : `Editando '${current.studentName} - ${current.challengeName}'`}
            </DialogTitle>
            <DialogContent>
                <div className='controls-container'>
                    {challenges && <SearchCombobox<ChallengesResponseItem>
                        value={selectedChallenge}
                        id="challenge-search-modal"
                        label="Desafio"
                        onChange={onSelectedChallengeChanges}
                        options={challenges}
                        getOptionLabel={(o: ChallengesResponseItem) => o.name ?? ''}
                        onAfter={onAfterChallengeSelectLoaded}
                    />}

                    {students && <SearchCombobox<StudentsResponseItem>
                        value={selectedStudent}
                        id="student-search-modal"
                        label="Estudante"
                        onChange={async (e: StudentsResponseItem) => await setSelectedStudent(e)}
                        options={students}
                        getOptionLabel={(o: StudentsResponseItem) => o.name ?? ''}
                        onAfter={onAfterStudentSelectLoaded}
                    />}

                    <TextField
                        className='txt-box txt-box-small'
                        id="valor-pago"
                        label="Valor pago"
                        type="number"
                        variant="outlined"
                        value={current.amountPaid}
                        onChange={(e) => setCurrent({ ...current, amountPaid: parseFloat(e.target.value) })}
                        InputLabelProps={{ shrink: true }}
                    />

                    {(!current || !current.challengeType || current.challengeType === 'Variavel') && <TextField
                        className='txt-box txt-box-small'
                        id="data-inicio-dt"
                        label="Data de inicio"
                        type="date"
                        variant="outlined"
                        value={current.begin}
                        onChange={(e) => setCurrent({ ...current, begin: moment(e.target.value).format("yyyy-MM-DD") as unknown as Date })}
                        InputLabelProps={{ shrink: true }}
                    />}

                    {!isNew && <FormControlLabel
                        control={
                            <Checkbox
                                checked={current?.active ?? false}
                                name="is-active"
                                color="primary"
                                onChange={async () => await setCurrent({ ...current!, active: current ? !current.active : false })}
                            />
                        }
                        label="Vinculo ativo?"
                    />}

                </div>
            </DialogContent>
            <DialogActions>
                <NormalButton onClick={onSave} color="primary">
                    Salvar
                </NormalButton>
                <WarningButton onClick={props.onClose} color="secondary">
                    Cancelar
                </WarningButton>
            </DialogActions>
        </Dialog>
    </>
}