import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Data, TimeSlot } from './models/Data';

@Injectable({
    providedIn: 'root'
})
export class RestService {
    constructor(private http: HttpClient) { }

    url: string = 'http://localhost:3000';
    data: Data;
    dataRequest: TimeSlot;

    async getData() {
        const res = await this.http.get<Data>(`${this.url}/data/1`).toPromise();
        this.data = res;
        return res;
    }
    updateData(id, day, hour) {
        this.dataRequest = {
            day: day,
            hour: hour
        }
        this.data.busySlots.push(this.dataRequest);
        return this.http.patch(`${this.url}/data/${id}`, {"busySlots" : this.data.busySlots});
    }
}