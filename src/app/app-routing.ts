/*
 * File: c:\Users\tonyw\Desktop\BH Labs NG\ng-bhlabs\src\app\app-routing.module.ts
 * Project: c:\Users\tonyw\Desktop\molexworks.com\ng-molex-works
 * Created Date: Saturday July 8th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Wed February 5th 2025 10:46:32 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

/**
 * Imports
 * This is where we import our modules to be routed
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './_components/home/home.component';
import { AboutComponent } from './_components/about/about.component';
import { ContactComponent } from './_components/about/contact/contact.component';
import { PortfolioComponent } from './_components/portfolio/portfolio.component';
import { DetailsComponent } from './_components/portfolio/details/details.component';
import { ServicesComponent } from './_components/about/services/services.component';

/**
 * Routes
 * This is where we define our routes for the application
 * @const - Array of routes
 * @type {Routes}
 */
const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'portfolio', component: PortfolioComponent },
  { path: 'portfolio/:id', component: DetailsComponent },
  { path: 'about/services', component: ServicesComponent },
  { path: 'about/contact', component: ContactComponent },
  { path: "", redirectTo: "/home", pathMatch: "full" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
