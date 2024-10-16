import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StatusService  {

  private apiUrl = environment.apiUrl + '/rs/etatservice';

  constructor(private http: HttpClient) { }

  getData(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(data => this.cleanData(data)) 
    );
  }

  private stripHtml(html: string): string {
    return html.replace(/<\/?[^>]+(>|$)/g, "");
  }

  private cleanData(data: any): any {
    if (typeof data === 'string') {
      return this.stripHtml(data); 
    } else if (Array.isArray(data)) {
      return data.map(item => this.cleanData(item)); 
    } else if (typeof data === 'object' && data !== null) {
      const cleanedObject: any = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          cleanedObject[key] = this.cleanData(data[key]);
        }
      }
      return cleanedObject;
    }
    return data; 
  }
}
