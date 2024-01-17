import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KeyboardComponent } from './page/keyboard/keyboard.component';
import { HomeComponent } from './page/home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'keyboard', component: KeyboardComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
