import { Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, Select, TextField } from "@mui/material";
import { ChallengesResponseItem } from 'src/contracts';
import { PaperComponent } from "../../components/dialogs";
import { useState } from "react";
import { ChallengeType } from "contracts/dist/challenges";
import { NormalButton, WarningButton } from "../../components/buttons";
import moment from "moment";
import { Duration } from "./challenges.models";

interface UpsertModalChallengeProps {
    current?: ChallengesResponseItem,
    onClose?: () => void,
    onSave: (c: ChallengesResponseItem) => void,
}

export default function UpsertModalChallenge(props: UpsertModalChallengeProps) {
    const [current, setCurrent] = useState(props.current ?? {} as ChallengesResponseItem);

    const isNew = current.name === undefined;

    const [type, setType] = useState<ChallengeType | undefined>(props.current ? props.current.type : undefined);
    const [duration, setDuration] = useState<Duration>(!props.current ? new Duration(1, 'Dias') : Duration.Parse(props.current.duration));

    const onSave = async () => {
        if (current.type === "Variavel")
            await setCurrent({ ...current, duration: duration.toString() });

        await props.onSave(current);
    }

    const changeType = async (e: any) => {
        const newType = e.target.value as ChallengeType;
        await setType(newType);
        await setCurrent({ ...current, type: newType });
    }

    const changeDuration = async (e: any) => {
        const convertedNumber = parseInt(e.target.value);
        if (!isNaN(convertedNumber)) {

            if (convertedNumber > 0)
                duration.amount = convertedNumber;
        } else {
            duration.type = e.target.value;
        }

        await setDuration(duration);
        await setCurrent({ ...current, duration: duration.toString() });
    }

    return <>
        <Dialog
            open
            maxWidth="lg"
            fullWidth
            aria-labelledby="draggable-dialog-title"
            PaperComponent={PaperComponent}
        >
            <DialogTitle id="draggable-dialog-title" style={{ cursor: 'move' }}>
                {isNew ? 'Novo Desafio' : `Editando Desafio '${current.name}'`}
            </DialogTitle>
            <DialogContent>
                <div className='flex-container'>
                    <TextField
                        className='txt-box txt-box-medium'
                        id="nome"
                        label="Nome"
                        variant="outlined"
                        value={current.name}
                        onChange={(e) => setCurrent({ ...current, name: e.target.value })}
                        error={!current.name}
                        helperText={!current.name ? 'Campo obrigatório' : ''}
                    />
                    <TextField
                        className='txt-box txt-box-medium'
                        id="description"
                        label="Descrição"
                        variant="outlined"
                        value={current.description}
                        onChange={(e) => setCurrent({ ...current, description: e.target.value })}
                    />
                    <FormControl variant="outlined" className="general-input form-control">
                        <InputLabel>Tipo</InputLabel>
                        <Select
                            native
                            label="Tipo"
                            value={current.type}
                            onChange={changeType}
                            inputProps={{
                                name: 'type',
                                id: 'type-id',
                                shrink: true
                            }}
                        >
                            <option aria-label="None" value="" />
                            <option value={'Fixo'}>Fixo</option>
                            <option value={'Variavel'}>Variável</option>
                        </Select>
                    </FormControl>

                    {type && type === "Fixo" && <>
                        <TextField
                            className="general-input"
                            id="inicio-date"
                            label="Início"
                            variant="outlined"
                            type="date"
                            value={current.begin}
                            onChange={(e) => setCurrent({ ...current, begin: moment(e.target.value).format("yyyy-MM-DD") as unknown as Date })}
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            className="general-input"
                            id="end-date"
                            label="Fim"
                            variant="outlined"
                            type="date"
                            value={current.end}
                            onChange={(e) => setCurrent({ ...current, end: moment(e.target.value).format("yyyy-MM-DD") as unknown as Date })}
                            InputLabelProps={{ shrink: true }}
                        />
                    </>}

                    {type && type === "Variavel" && <>
                        <TextField
                            id="valor"
                            className="general-input"
                            label="Intervalo"
                            variant="outlined"
                            type="number"
                            value={duration.amount}
                            onChange={changeDuration}
                            InputLabelProps={{ shrink: true }}
                        />

                        <FormControl
                            variant="outlined"
                            className="general-input" style={{ minWidth: '150px' }}>
                            <InputLabel>Tipo de intervalo</InputLabel>
                            <Select
                                native
                                label="Tipo de intervalo"
                                value={duration.type}
                                onChange={changeDuration}
                                inputProps={{
                                    name: 'type-interval',
                                    id: 'type-id-interval',
                                    shrink: true
                                }}
                            >
                                <option aria-label="None" value="" />
                                <option value={'Dias'}>Dias</option>
                                <option value={'Meses'}>Meses</option>
                            </Select>
                        </FormControl>
                    </>}

                    <TextField
                        id="valor"
                        label="Valor (R$)"
                        variant="outlined"
                        className="general-input"
                        type="number"
                        value={current.price}
                        onChange={(e) => setCurrent({ ...current, price: parseFloat(e.target.value) })}
                        InputLabelProps={{ shrink: true }}
                    />
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