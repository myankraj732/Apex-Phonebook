import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { ContactService } from "../../services/contacts.service";
import { NgForm } from "@angular/forms";
import { Contact } from "../contact-list/contact";


@Component({
    selector: 'app-contact-form',
    templateUrl: './contact-form.component.html',
    styleUrls: ['./contact-form.component.css']
})
export class ContactFormComponent implements OnInit, OnChanges {
    @Input() contact: Contact = {} as Contact;
    @Output() userAdded = new EventEmitter();
    model = <Contact>{};
    submitted = false;
    btnName = 'Submit';
    id: Number = -1;
    @Input() mode: 'create' | 'edit' = 'create';
    emailFormatError = false;

    constructor(private contactService: ContactService) {
    }

    ngOnInit(): void {
    }

    ngOnChanges() {
        if (this.contact) {
            this.model = { ...this.contact };
        }
    }

    createNew() {
        return {} as Contact;
    }

    getContact(id: number) {
        if (id > 0) {
            this.contactService.getById(id).subscribe((contact: Contact) => {
                this.model = { ...contact }
            })
        }
    }

    validateEmail(email: string) {
        let re = /\S+@\S+\.\S+/
        const valid =  re.test(email);
        this.emailFormatError = !valid;
    }

    onSubmit(contactForm: NgForm) {
        if (contactForm.valid && !this.emailFormatError) {
            this.submitted = true;
            this.contactService.hasContact(contactForm.value).subscribe((hasContact) => {
                if (hasContact && this.mode == 'create') {
                    alert('Already exists')
                    console.log(contactForm.value);
                    this.submitted = false;
                    return;
                }
                let obs = this.mode == 'create' ? this.contactService.postContact(this.model)
                    : this.contactService.putContact(this.model);
                obs.subscribe((contact) => {
                    this.model = this.createNew();
                    this.submitted = false;
                    contactForm.resetForm();
                    this.userAdded.emit();
                    this.mode = 'create';
                });
            })
        }
        console.log('submitted');
    }

    validEmail(email: string | undefined) {
        if(email) {
            return new RegExp('/\S+@\S+\.\S+/').test(email);
        } else {
            return false;
        }
    }

    get diagnostic() {
        return JSON.stringify(this.model);
    }

}
