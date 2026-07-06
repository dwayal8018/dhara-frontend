import { Component, input } from '@angular/core';

@Component({
  selector: 'dh-input',
  imports: [],
  standalone: true,
  templateUrl: './input.html',
  styleUrl: './input.scss',
})
export class Input { 

  label = input('');

  placeholder = input('');

  type = input('text');

  disabled = input(false);
}
