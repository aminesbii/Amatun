
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-site-card',
  standalone: false,
  templateUrl: './site-card.component.html',
  styleUrls: ['./site-card.component.css']
})
export class SiteCardComponent {

  @Input() title: string = '';
  @Input() description: string = '';
  @Input() url: string = '#';
  @Input() icon: string = '';
  @Input() imgSrc: string = '';
}
