import { Component, ViewChild, ElementRef } from '@angular/core';
import { StatusService } from '../services/status.service';
import { CommonModule } from '@angular/common';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {AsyncPipe} from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
  ],
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent {
  @ViewChild('inputBus', { static: false }) inputBus!:  ElementRef;

  dataMap: { [key: string]: any } = {};
  filteredItems: { [key: string]: any } = {};

  myControl = new FormControl('');
  options: string[] = [ 'All', '1', '2', '4', '5',
    '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
    '22', '24', '25', '26', '27', '28', '29', '30', '31', '32',
    '33', '34', '35', '36', '37', '38', '39', '40', '41', '43',
    '44', '45', '46', '47', '48', '49', '51', '52', '54', '55',
    '56', '57', '58', '61', '63', '64', '66', '67', '68', '69',
    '70', '71', '72', '73', '74', '75', '78', '80', '81', '85',
    '86', '90', '92', '93', '94', '95', '97', '99', '100', '101',
    '102', '103', '104', '105', '106', '107', '108', '109', '110',
    '112', '113', '114', '115', '116', '117', '119', '121', '123',
    '124', '125', '126', '128', '129', '131', '135', '136', '138',
    '139', '140', '141', '144', '146', '150', '160', '161', '162',
    '164', '165', '166', '168', '170', '171', '172', '174', '175',
    '176', '177', '179', '180', '183', '185', '186', '187', '188',
    '189', '190', '191', '192', '193', '195', '196', '197', '200',
    '201', '202', '203', '204', '205', '206', '207', '208', '209',
    '211', '212', '213', '215', '216', '217', '218', '219', '220',
    '225', '252', '253', '254', '256', '257', '258', '259', '260',
    '262', '263', '270', '271', '272', '280', '281', '282', '283',
    '284', '285', '287', '288', '289', '290', '292', '293', '350',
    '353', '354', '355', '356', '357', '358', '359', '360', '361',
    '362', '363', '364', '365', '368', '369', '370', '371', '372',
    '376', '378', '380', '382', '401', '405', '406', '407', '409',
    '410', '411', '419', '420', '425', '427', '428', '430', '432',
    '439', '440', '444', '445', '448', '449', '460', '465', '467',
    '468', '469', '470', '475', '480', '485', '486', '487', '491',
    '495', '496', '568', '711', '715', '747', '767', '768', '769',
    '777', '811', '872'];
  filteredOptions!: Observable<string[]>;

  constructor(private statusService: StatusService) { }

  ngOnInit(): void {
    this.statusService.getData().subscribe(
      data => {
        this.dataMap = data;
        this.filteredItems = this.dataMap;
        console.log(data);
      },
      error => {
        console.error('Error fetching data', error);
      }
    );

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  ngOnDestroy(): void {
  }

  filterMap() {
    this.filteredItems = {};
    const inputValue = this.inputBus.nativeElement.value;
    
    if (inputValue === 'All') {
      this.filteredItems = this.dataMap;
      return;
    }
    
    Object.keys(this.dataMap).forEach(key => {
      if (key === inputValue) { 
        this.filteredItems[key] = this.dataMap[key];
        return;
      }
    });
  }
  

  formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Not provided';
    const date = new Date(dateStr);
    return date.toLocaleString();
  }

  getKeys(map: { [key: string]: any }): string[] {
    return Object.keys(map);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }
  
}
