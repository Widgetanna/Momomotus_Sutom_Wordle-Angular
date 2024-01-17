import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServiceSutomService {
  title: string = 'MOMOMOTUS';
  private readonly USER_NAME_KEY = 'user_name';

  saveUserName(userName: string): void {
    localStorage.setItem(this.USER_NAME_KEY, userName);
  }

  getUserName(): string | null {
    return localStorage.getItem(this.USER_NAME_KEY);
  }
}
