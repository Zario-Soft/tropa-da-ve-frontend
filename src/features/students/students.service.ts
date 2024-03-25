import { AxiosResponse } from 'axios';
import { HttpClient } from '../../infrastructure/httpclient.component';
import { StudentsResponse, StudentsResponseItem } from 'src/contracts';

type StudentsRequest = StudentsResponseItem;

export class StudentsService {
    private readonly request: HttpClient;
    private readonly BASE_URL: string = 'students';

    constructor() {
        this.request = new HttpClient();
    }

    public async getAll(): Promise<AxiosResponse<StudentsResponse>> {
        return await this.request.get(this.BASE_URL);
    }

    public async getById(id: number): Promise<AxiosResponse<StudentsResponseItem>> {
        return await this.request.get(`${this.BASE_URL}/${id}`);
    }

    public async edit(request : StudentsRequest): Promise<void> {
        await this.request.put(`${this.BASE_URL}/${request.id}`, request);
    }

    public async new(request : StudentsRequest): Promise<any> {
        return await this.request.post(this.BASE_URL, request);
    }

    public async delete(id: number): Promise<void> {
        await this.request.delete(`${this.BASE_URL}/${id}`);
    }
}


export default StudentsService;