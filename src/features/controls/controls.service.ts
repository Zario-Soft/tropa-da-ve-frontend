import { AxiosResponse } from 'axios';
import { HttpClient } from '../../infrastructure/httpclient.component';
import { ControlsResponse, ControlsRequest, ControlsResponseItem } from 'src/contracts';
import { BillsFiltersResult } from './bills/filters';
import { ControlsResponseItemWithEndDate } from 'src/contracts/controls';

export class ControlsService {
    private readonly request: HttpClient;
    private readonly BASE_URL: string = 'controls';

    constructor() {
        this.request = new HttpClient();
    }

    public async getAll(): Promise<AxiosResponse<ControlsResponse>> {
        return await this.request.get(this.BASE_URL);
    }

    public async getByDates(req: BillsFiltersResult): Promise<AxiosResponse<ControlsResponse>> {
        return await this.request.post(`${this.BASE_URL}/bydates`, req);
    }

    public async getByExpiryDates(req: BillsFiltersResult): Promise<AxiosResponse<{ items: ControlsResponseItemWithEndDate[] }>> {
        return await this.request.post(`${this.BASE_URL}/byexpirydates`, req);
    }

    public async getLastActiveByStudent(studentId: number): Promise<AxiosResponse<ControlsResponseItem | undefined>> {
        return await this.request.get(`${this.BASE_URL}/students/${studentId}`);
    }

    public async edit(id: number, request : ControlsRequest): Promise<void> {
        await this.request.put(`${this.BASE_URL}/${id}`, request);
    }

    public async new(request : ControlsRequest): Promise<void> {
        await this.request.post(this.BASE_URL, request);
    }

    public async delete(id: number): Promise<void> {
        await this.request.delete(`${this.BASE_URL}/${id}`);
    }
}


export default ControlsService;