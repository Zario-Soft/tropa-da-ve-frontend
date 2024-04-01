import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { ChallengesResponseItem, ControlsResponseItem, StudentsResponseItem } from 'src/contracts';
import { PaperComponent } from "../../components/dialogs";
import { useContext, useEffect, useState } from "react";
import { NormalButton, WarningButton } from "../../components/buttons";
import SearchCombobox from "../../components/combobox/search-combo";
import ChallengesService from "../challenges/challenges.service";
import { toast } from "react-toastify";
import { LoadingContext } from "../../providers/loading.provider";
import { calculateEndDate } from "../../infrastructure/helpers";
import ControlsService from "../controls/controls.service";
import moment from "moment";

export interface UpsertStudentResponse {
    student: StudentsResponseItem,
    challenge?: ChallengesResponseItem,
    control?: ControlsResponseItem,
}

interface UpsertModalChallengeProps {
    current?: StudentsResponseItem,
    onClose?: () => void,
    onSave: (c: UpsertStudentResponse) => void,
}

interface ChallengesResponseWithLabel {
    challenge: ChallengesResponseItem,
    label?: string
}

export default function UpsertModalStudent(props: UpsertModalChallengeProps) {
    const challengeService = new ChallengesService();
    const controlsService = new ControlsService();

    const { setIsLoading } = useContext(LoadingContext);

    const [current, setCurrent] = useState(props.current ?? {} as StudentsResponseItem);

    const [challenges, setChallenges] = useState<ChallengesResponseItem[]>([]);
    const [selectedChallenge, setSelectedChallenge] = useState<ChallengesResponseWithLabel>();
    const [control, setControl] = useState<ControlsResponseItem>();

    const isNew = current.name === undefined;

    const onSave = async () => {
        await props.onSave({
            student: current,
            challenge: selectedChallenge?.challenge,
            control: control
        });
    }

    const onChallengeSelectChange = async (challenge?: ChallengesResponseItem, localControl?:ControlsResponseItem) => {
        if (challenge) {
            const beginDate = localControl?.begin ?? control?.begin ?? challenge.begin;
            const endDate = calculateEndDate(challenge.type, challenge.duration, challenge.end, beginDate);

            const label = `Vencimento em: ${endDate}`

            await setSelectedChallenge({ challenge: {...challenge, begin: beginDate}, label });

            if (control && control.challengeId !== challenge.id) {
                await setControl(undefined);
            }
        }
        else {
            await setSelectedChallenge(undefined);
        }
    }

    const loadChallenges = async () => {
        try {
            await setIsLoading(true);

            const { data } = await challengeService.getAll();

            if (data && data.items) {
                const result = [...data.items, { name: "" } as unknown as ChallengesResponseItem];
                await setChallenges(result);

                return result;
            }
        } catch {
            toast.error('Não foi possivel carregar os dados. Verifique a internet.');
        }
        finally {
            await setIsLoading(false);
        }
    }

    const loadInfo = async () => {
        await loadChallenges();
    }

    const onAfterSelectLoaded = async (challenges?: ChallengesResponseItem[]): Promise<ChallengesResponseItem | undefined> => {
        if (!isNew && current.id) {
            const { data } = await controlsService.getLastActiveByStudent(current.id);
            if (data) {
                await setControl(data);

                if (challenges) {
                    const challenge = challenges.find(f => f.id === data!.challengeId);
                    await onChallengeSelectChange(challenge);
                    return challenge;
                }
            }
        }

        return undefined;
    }

    const onAgeChange = (e: any) => {
        const newValue = parseInt(e.target.value);
        if (newValue >= 0)
            setCurrent({ ...current, age: newValue })
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
                {isNew ? 'Novo Aluno' : `Editando Aluno '${current.name}'`}
            </DialogTitle>
            <DialogContent>
                <div className='flex-container'>
                    <TextField
                        className='txt-box txt-box-large'
                        id="nome"
                        label="Nome"
                        variant="outlined"
                        value={current.name}
                        onChange={(e) => setCurrent({ ...current, name: e.target.value })}
                        error={!current.name}
                        helperText={!current.name ? 'Campo obrigatório' : ''}
                    />
                    <TextField
                        className='txt-box txt-box-small'
                        id="Idade"
                        label="Idade"
                        type="number"
                        variant="outlined"
                        value={current.age}
                        onChange={onAgeChange}
                    />

                    <TextField
                        className='txt-box txt-box-medium'
                        id="telephone"
                        label="Telefone"
                        type='tel'
                        variant="outlined"
                        value={current.telephone}
                        onChange={(e) => setCurrent({ ...current, telephone: e.target.value })}
                    />

                    <TextField
                        className='txt-box txt-box-medium'
                        id="telephone"
                        label="E-mail"
                        type='email'
                        variant="outlined"
                        value={current.email}
                        onChange={(e) => setCurrent({ ...current, email: e.target.value })}
                    />

                    <TextField
                        className='txt-box txt-box-medium'
                        id="city"
                        label="Cidade"
                        variant="outlined"
                        value={current.city}
                        onChange={(e) => setCurrent({ ...current, city: e.target.value })}
                    />

                    <hr style={{ width: '100%' }} />
                    <div style={{
                        width: '100%',
                        display: 'flex',
                        gap: '30px',
                        marginTop: '15px'
                    }}>
                        {challenges && <SearchCombobox<ChallengesResponseItem>
                            value={selectedChallenge?.challenge}
                            id="challenge-search"
                            label="Desafio"
                            onChange={onChallengeSelectChange}
                            options={challenges}
                            getOptionLabel={(o: ChallengesResponseItem) => o.name ?? ''}
                            onAfter={onAfterSelectLoaded}
                        />}
                        {selectedChallenge && <TextField
                            className='txt-box txt-box-small'
                            id="data-inicio-dt"
                            label="Data de inicio"
                            type="date"
                            variant="outlined"
                            value={control?.begin ?? selectedChallenge.challenge.begin ?? moment().format("yyyy-MM-DD") as unknown as Date}
                            onChange={async (e) => {
                                const changedDate = moment(e.target.value).format("yyyy-MM-DD") as unknown as Date;

                                const localSelectedChallenge = {
                                    ...selectedChallenge,
                                    challenge: {
                                        ...selectedChallenge.challenge,
                                        begin: changedDate
                                    }
                                };

                                let localControl: ControlsResponseItem | undefined;

                                await setSelectedChallenge(localSelectedChallenge);
                                if (control){
                                    localControl = {...control, begin: changedDate};
                                    await setControl(localControl);
                                }

                                await onChallengeSelectChange(localSelectedChallenge.challenge, localControl);
                            }}
                            InputLabelProps={{ shrink: true }}
                        />}

                        {selectedChallenge && <p>{selectedChallenge.label}</p>}
                    </div>

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