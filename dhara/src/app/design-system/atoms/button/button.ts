import { Component, input } from '@angular/core';
import { ButtonSize, ButtonVariant } from '../../types/button.types';
import { CommonModule, NgClass } from '@angular/common';

@Component({
  selector: 'dh-button',
  standalone: true,
  imports: [ CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {

  variant = input<ButtonVariant>('primary');

  size = input<ButtonSize>('md');

  disabled = input(false);

  loading = input(false);

  fullWidth = input(false);

}