import SearchCombobox from "src/components/combobox/search-combo";
import { ChallengesResponseItem } from "src/contracts";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { LoadingContext } from "src/providers/loading.provider";
import ChallengesService from "./challenges.service";

interface SearchComboboxChallengeProps {
    onSelectedChallengeChanges: (e?: ChallengesResponseItem) => Promise<void>,
}

export default function SearchComboboxChallenge(props: SearchComboboxChallengeProps) {
    const challengeService = new ChallengesService();
    const { setIsLoading } = useContext(LoadingContext);

    const [challenges, setChallenges] = useState<ChallengesResponseItem[]>([]);
    const [selectedChallenge, setSelectedChallenge] = useState<ChallengesResponseItem | undefined>();

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

    useEffect(() => { loadChallenges() },
    // eslint-disable-next-line
    []);

    const onAfterChallengeSelectLoaded = async (challenges?: ChallengesResponseItem[]): Promise<ChallengesResponseItem | undefined> => {
        const challenge = challenges?.find(f => f.id === selectedChallenge?.id);

        await props.onSelectedChallengeChanges(challenge);

        await setSelectedChallenge(challenge);

        return challenge;
    };

    return <SearchCombobox<ChallengesResponseItem>
        value={selectedChallenge}
        id="challenge-search-modal"
        label="Desafio"
        onChange={props.onSelectedChallengeChanges}
        options={challenges}
        getOptionLabel={(o: ChallengesResponseItem) => o.name ?? ''}
        onAfter={onAfterChallengeSelectLoaded}
    />
}