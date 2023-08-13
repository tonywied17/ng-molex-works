/*
 * File: c:\Users\tonyw\Desktop\BH Labs NG\ng-bhlabs\src\app\app.module.ts
 * Project: c:\Users\tonyw\Desktop\MolexWorks NG\ng-molex-works
 * Created Date: Saturday July 8th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sun August 13th 2023 4:39:46 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { MaterialModule } from './material';
import { AppRoutingModule } from './app-routing';
import { HomeComponent } from './_components/home/home.component'
import { AboutComponent } from './_components/about/about.component';
import { ContactComponent } from './_components/about/contact/contact.component';
import { PortfolioComponent } from './_components/portfolio/portfolio.component';
import { ServicesComponent } from './_components/about/services/services.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { DetailsComponent } from './_components/portfolio/details/details.component';
import { ServiceWorkerModule } from '@angular/service-worker';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
    ContactComponent,
    PortfolioComponent,
    ServicesComponent,
    DetailsComponent
  ],
  imports: [
    BrowserModule,
    MaterialModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
