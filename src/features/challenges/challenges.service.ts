import { AxiosResponse } from 'axios';
import { HttpClient } from '../../infrastructure/httpclient.component';
import { ChallengesResponseItem, ChallengesResponse } from 'src/contracts';

type ChallengeRequest = ChallengesResponseItem;

export class ChallengesService {
    private readonly request: HttpClient;
    private readonly BASE_URL = `challenges`
    constructor() {
        this.request = new HttpClient();
    }

    public async getAll(): Promise<AxiosResponse<ChallengesResponse>> {
        return await this.request.get(this.BASE_URL);
    }

    public async getAllActive(): Promise<AxiosResponse<ChallengesResponse>> {
        return await this.request.get(`${this.BASE_URL}/active`);
    }

    public async edit(request : ChallengeRequest): Promise<void> {
        await this.request.put(`${this.BASE_URL}/${request.id}`, request);
    }

    public async new(request : ChallengeRequest): Promise<void> {
        await this.request.post(this.BASE_URL, request);
    }

    public async delete(id: number): Promise<void> {
        await this.request.delete(`${this.BASE_URL}/${id}`);
    }
}


export default ChallengesService;