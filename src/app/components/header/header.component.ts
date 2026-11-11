import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  protected readonly teamName = 'VBE Eagles Echternach';
  protected readonly slogan = '#goeagles';
}
