import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceSutomService } from 'src/app/services/service-sutom.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  userName: string = '';
  title: string = ''; 
  constructor(
    private serviceSutomService: ServiceSutomService,
    private router: Router) {}

    ngOnInit(): void {
      this.title = this.serviceSutomService.title;
     
    }

    saveUserName(): void {
    console.log('Saving username:', this.userName);
    this.serviceSutomService.saveUserName(this.userName);
    }

     getUserName(): void {
     const storedName = this.serviceSutomService.getUserName();
     if (storedName) {
      this.userName = storedName;
      }
    }
    navigateToNewPage(): void {
    this.saveUserName(); 
    this.router.navigate(['/keyboard']); 
    }

}
