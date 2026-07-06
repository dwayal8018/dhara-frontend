import { Component, input } from '@angular/core';

@Component({
  selector: 'dh-card',
  imports: [],
  standalone: true,
  templateUrl: './card.html',
  styleUrl: './card.scss',
})
export class Card {
  title = input('');
}
