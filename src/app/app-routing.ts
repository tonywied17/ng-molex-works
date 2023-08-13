/*
 * File: c:\Users\tonyw\Desktop\BH Labs NG\ng-bhlabs\src\app\app-routing.module.ts
 * Project: c:\Users\tonyw\Desktop\BH Labs NG\ng-bhlabs
 * Created Date: Saturday July 8th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sun August 13th 2023 1:56:04 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './_components/home/home.component'; 
import { AboutComponent } from './_components/about/about.component';
import { ContactComponent } from './_components/contact/contact.component';
import { PortfolioComponent } from './_components/portfolio/portfolio.component';
import { DetailsComponent } from './_components/portfolio/details/details.component';
import { ServicesComponent } from './_components/about/services/services.component';
const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'portfolio', component: PortfolioComponent },
  { path: 'portfolio/:id', component: DetailsComponent },
  { path: 'about/services', component: ServicesComponent },
  { path: "", redirectTo: "/home", pathMatch: "full" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
