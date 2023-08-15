/*
 * File: c:\Users\tonyw\Desktop\MolexWorks NG\ng-molex-works\src\app\_components\about\contact\quote-request\quote-request.component.ts
 * Project: c:\Users\tonyw\Desktop\MolexWorks NG\ng-molex-works
 * Created Date: Monday August 14th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Mon August 14th 2023 10:13:06 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
import { Component, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgForm } from '@angular/forms';

/**
 * @component QuoteRequestComponent
 */
@Component({
  selector: 'app-quote-request',
  templateUrl: './quote-request.component.html',
  styleUrls: ['./quote-request.component.scss']
})

export class QuoteRequestComponent {
  submitted = false;
  isSentSuccessfully: boolean = false;
  name: string = '';
  email: string = '';
  phone: string = '';
  description: string = '';
  budget: string = '';
  @ViewChild('quoteForm', { static: false }) quoteForm!: NgForm;

  webhookUrl: string = 'https://discord.com/api/webhooks/1140693767481983066/c78UotK1m6rka4huWIjJvuc319bBvYcr02UZgrXrbo6IkUhtmiajuIhUpN0d3MH6Ubke';

  constructor(private http: HttpClient) { }

  sendRequest() {
    this.submitted = true;
    const formattedBudget = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(this.budget));
    const hexToDecimal = (hex: string) => parseInt(hex.replace(/^#/, ''), 16);

    if (this.quoteForm.valid) {
      const embed = {
        color: hexToDecimal('#94a3b8'),
        fields: [
            { name: 'Name', value: this.name },
            { name: 'Email', value: this.email },
            { name: 'Phone', value: this.phone },
            { name: 'Description', value: this.description },
            { name: 'Budget', value: formattedBudget }
        ],
        thumbnail: {
            url: 'https://molex.cloud/2023/August/14/_oJp/quote.png' 
        },
        author: {
          name: 'MolexWorks', 
          icon_url: 'https://molex.cloud/2023/August/14/_1sg/v878-mind-13.jpg' 
      }
    };

        this.http.post(this.webhookUrl, { embeds: [embed] }).subscribe(response => {
            const formElement = document.querySelector('.quote-request');
            if (formElement) {
                formElement.classList.add('shake-animation');
                setTimeout(() => {
                    formElement.classList.remove('shake-animation');
                    this.isSentSuccessfully = true;
                    this.name = '';
                    this.email = '';
                    this.phone = '';
                    this.description = '';
                    this.budget = '';
                    this.quoteForm.resetForm();
                    this.submitted = false;
                    setTimeout(() => {
                        this.isSentSuccessfully = false;
                    }, 3000);
                }, 1000);
            }
        }, error => {});
    } else {
        Object.keys(this.quoteForm.controls).forEach(key => {
            this.quoteForm.controls[key].markAsTouched();
        });
    }
}





}
