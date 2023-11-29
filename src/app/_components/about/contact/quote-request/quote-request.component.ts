/*
 * File: c:\Users\tonyw\Desktop\MolexWorks NG\ng-molex-works\src\app\_components\about\contact\quote-request\quote-request.component.ts
 * Project: c:\Users\tonyw\Desktop\MolexWorks NG\ng-molex-works
 * Created Date: Monday August 14th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Tue November 28th 2023 12:06:14 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
import { Component, ViewChild, OnInit } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { NgForm } from "@angular/forms";

/**
 * @component QuoteRequestComponent
 */
@Component({
    selector: "app-quote-request",
    templateUrl: "./quote-request.component.html",
    styleUrls: ["./quote-request.component.scss"],
})

export class QuoteRequestComponent implements OnInit {
    /**
     * Properties
     */
    submitted = false;
    isSentSuccessfully: boolean = false;
    name: string = "";
    email: string = "";
    phone: string = "";
    description: string = "";
    budget: string = "";
    @ViewChild("quoteForm", { static: false }) quoteForm!: NgForm;
    webhookUrl: string =
        "https://discord.com/api/webhooks/1179105819736948816/MYSsntSOoJQ3r8MMqG5895CBslfEHWEmyezERBNGy2tDemX3GoIO9-NGI90uImfmLBtl";

    /**
     * Constructors
     * @param http - HttpClient
     */
    constructor(private http: HttpClient) { }

    /**
     * ngOnInit - Lifecycle hook
     */
    ngOnInit(): void {
        if (this.quoteForm && this.quoteForm.valueChanges) {
            this.quoteForm.valueChanges.subscribe((values) => {
                if (values.phone && !/^\(\d{3}\) \d{3}-\d{4}$/.test(values.phone)) {
                    this.formatPhone();
                }
            });
        }
    }

    /**
     * @method sendRequest
     * @description - Sends the quote request to the discord webhook
     * @returns void
     */
    sendRequest() {
        this.submitted = true;

        const numericBudget = parseFloat(this.budget.replace(/[$,]/g, ""));
        const formattedBudget = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(Number(numericBudget));
        const hexToDecimal = (hex: string) => parseInt(hex.replace(/^#/, ""), 16);

        if (this.quoteForm.valid) {
            const embed = {
                color: hexToDecimal("#a1a1a1"),
                fields: [
                    { name: "Name", value: this.name },
                    { name: "Email", value: this.email },
                    { name: "Phone", value: this.phone },
                    { name: "Description", value: this.description },
                    { name: "Budget", value: formattedBudget },
                ],
                thumbnail: {
                    url: "https://molex.cloud/2023/August/14/_oJp/quote.png",
                },
                author: {
                    name: "MolexWorks",
                    icon_url: "https://molex.cloud/2023/August/14/_1sg/v878-mind-13.jpg",
                },
            };

            this.http.post(this.webhookUrl, { embeds: [embed] }).subscribe(
                (response) => {
                    const formElement = document.querySelector(".quote-request");
                    if (formElement) {
                        formElement.classList.add("shake-animation");
                        setTimeout(() => {
                            formElement.classList.remove("shake-animation");
                            this.isSentSuccessfully = true;
                            this.name = "";
                            this.email = "";
                            this.phone = "";
                            this.description = "";
                            this.budget = "";
                            this.quoteForm.resetForm();
                            this.submitted = false;
                            setTimeout(() => {
                                this.isSentSuccessfully = false;
                            }, 3000);
                        }, 1000);
                    }
                },
                (error) => { }
            );
        } else {
            Object.keys(this.quoteForm.controls).forEach((key) => {
                this.quoteForm.controls[key].markAsTouched();
            });
        }
    }

    /**
     * @method formatPhone
     * @description - Formats the phone number
     * @returns void
     */
    formatPhone(): void {
        let numbers = this.phone.replace(/\D/g, "");
        numbers = numbers.substring(0, 10);

        if (numbers.length <= 3) {
            this.phone = `(${numbers}`;
        } else if (numbers.length > 3 && numbers.length <= 6) {
            const areaCode = numbers.substr(0, 3);
            const prefix = numbers.substr(3);
            this.phone = `(${areaCode})${prefix}`;
        } else if (numbers.length > 6) {
            const areaCode = numbers.substr(0, 3);
            const prefix = numbers.substr(3, 3);
            const lineNum = numbers.substr(6);
            this.phone = `(${areaCode}) ${prefix}-${lineNum}`;
        }
    }

    /**
     * @method formatBudget
     * @description - Formats the budget
     * @returns void
     */
    formatBudget(): void {
        let numbers = this.budget.replace(/[^0-9.]/g, "");

        let parts = numbers.split(".");
        let integerPart = parts[0];
        let decimalPart = parts[1] || "";

        if (decimalPart.length > 2) {
            decimalPart = decimalPart.substring(0, 2);
        }

        integerPart = new Intl.NumberFormat("en-US").format(+integerPart);

        if (decimalPart.length) {
            this.budget = `$${integerPart}.${decimalPart}`;
        } else {
            this.budget = `$${integerPart}`;
        }
    }
}
