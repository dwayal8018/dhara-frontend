import { Component, input } from '@angular/core';

@Component({
  selector: 'dh-badge',
  imports: [],
  templateUrl: './badge.html',
  styleUrl: './badge.css',
})
export class Badge {
    text=input('');
}
