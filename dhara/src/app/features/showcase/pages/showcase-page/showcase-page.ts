import { Component, input } from '@angular/core';
import { Badge, Button, Card, Input } from '../../../../design-system';

@Component({
  selector: 'app-showcase-page',
   standalone: true,
  imports: [Button,Input,Card,Badge],
  templateUrl: './showcase-page.html',
  styleUrl: './showcase-page.scss',
})
export class ShowcasePage {}
