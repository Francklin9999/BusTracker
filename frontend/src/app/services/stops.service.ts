import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as Papa from 'papaparse';

@Injectable({
  providedIn: 'root'
})
export class StopsService {

  private filePath = 'assets/files/stops.csv'

  constructor(private http: HttpClient) { }

  getParsedData() : Observable<any> {
    return new Observable(observer => {
      this.http.get(this.filePath, { responseType: 'text'}).subscribe(
        csvData => {
          Papa.parse(csvData, {
            header: true,
            dynamicTyping: true,
            complete: (result: any) => {
              const parsedData = this.transformData(result.data);
              observer.next(parsedData);
              observer.complete();
            },
            error: (error: any) => {
              observer.error(error);
            }
          });
        },
        error => observer.error(error)
      );
    });
  }

  private transformData(data: any[]): any {
    const result: { [key: string]: any} = {};
    data.forEach(row => {
      if (row.stop_code) {
        result[row.stop_code] = {
          stop_code: row.stop_code,
          stop_id: row.stop_id,
          stop_name: row.stop_name,
          stop_lat: parseFloat(row.stop_lat),
          stop_lon: parseFloat(row.stop_lon),
        };
      }
  });
  return result;
}
}
