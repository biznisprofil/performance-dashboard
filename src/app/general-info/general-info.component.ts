import { Component, Input } from '@angular/core';
import { GeneralInfo } from '../core/models/general-info.model';

@Component({
  selector: 'app-general-info',
  templateUrl: './general-info.component.html',
  styleUrls: ['./general-info.component.scss'],
})
export class GeneralInfoComponent {
  @Input() generalInfo?: GeneralInfo;
}
