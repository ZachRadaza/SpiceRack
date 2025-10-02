interface SignUpFields {
    username: string,
    email: string,
    password: string
}

export class SignUpDialog extends HTMLDialogElement{

    private initialized: boolean = false;

    async connectedCallback(){
        if(this.initialized) return;

        const [html, css] = await Promise.all([
            fetch(new URL("./sign-up.html", import.meta.url)).then(r => r.text()),
            fetch(new URL("./sign-up.css", import.meta.url)).then(r => r.text())
        ]);

        this.innerHTML = `
            <link rel="stylesheet" href="styles.css">
            <style>${css}</style>
            ${html}`
        ;

        this.initializeHTMLElements();

        this.initialized = true;
    }

    private initializeHTMLElements(){
        const submit = this.querySelector<HTMLButtonElement>("#dlg-submit");
        const close = this.querySelector<HTMLButtonElement>("#dlg-close")

        if(!submit || !close){
            throw new Error("#dlg-submit not found in sign-up.html");
        }

        submit.addEventListener("click", () => this.createAccount());
        close.addEventListener("click", () => this.close());
    }

    private async createAccount(){
        const inputs = this.gatherInputs();

        const validInputs = await this.validateInputs(inputs);

        if(validInputs){
            //call backend
        } 
    }

    private gatherInputs(): SignUpFields{
        const usernameInput = this.querySelector<HTMLInputElement>("#dlg-username");
        const emailInput = this.querySelector<HTMLInputElement>("#dlg-email");
        const passwordInput = this.querySelector<HTMLInputElement>("#dlg-password");

        if(!usernameInput || !emailInput || !passwordInput){
            throw new Error("#dlg-username, #dlg-email, #dlg-password not found in sign-up.html");
        }

        const username = usernameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;

        return { username, email, password };
    }

    private async validateInputs(inputs: SignUpFields): Promise<boolean>{
        let valid: boolean = true;

        const userValid = await validateUsername(inputs.username);
        const emailValid = await validateEmail(inputs.email);
        const passwordValid = await validatePassword(inputs.password);

        if(!userValid){
            //add stuff to dialog

            valid = false;
        }

        if(!emailValid){
            //add stiff to dialog

            valid = false;
        }

        if(!passwordValid){
            //add stuff to dialog

            valid = false;
        }

        return valid;

        async function validateUsername(username: string): Promise<boolean>{
            let valid = true;

            //check syntax

            //check backend if taken

            return valid;
        }

        async function validateEmail(email: string): Promise<boolean>{
            let valid = true;

            //check syntax

            //check backend if taken

            return valid;
        }

        function validatePassword(password: string): boolean{
            let valid = true;

            //check syntax

            return valid;
        }
    }
}
customElements.define("sign-up-dialog", SignUpDialog, { extends: 'dialog'});