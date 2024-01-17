import { Component } from '@angular/core';
import { ServiceSutomService } from 'src/app/services/service-sutom.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  userName: string | null = null;
  title: string = ''; 

  constructor(private serviceSutomService: ServiceSutomService) {}
  
  ngOnInit(): void {
    this.title = this.serviceSutomService.title;
    this.getUserName();
  }

  getUserName(): void {
    this.userName = this.serviceSutomService.getUserName();
  }
}
