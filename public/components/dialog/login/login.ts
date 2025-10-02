interface LoginFields{
    user: string,
    password: string
}

export class LoginDialog extends HTMLDialogElement{

    private initialized: boolean = false;

    async connectedCallback(){
        if(this.initialized) return;

        const [html, css] = await Promise.all([
            fetch(new URL("./login.html", import.meta.url)).then(r => r.text()),
            fetch(new URL("./login.css", import.meta.url)).then(r => r.text())
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

        if(!submit){
            throw new Error("#dlg-submit not found in login.html");
        }

        submit.addEventListener("click", () => this.loginAccount());
    }

    private async loginAccount(){
        const inputs = this.gatherInputs();

        const valid = await this.validateInputs(inputs);

        if(valid){
            //sign them in
        } else {
            //add message about sign up fail
        }
    }

    private gatherInputs(): LoginFields{
        const userInput = this.querySelector<HTMLInputElement>("#dlg-user");
        const passwordInput = this.querySelector<HTMLInputElement>("#dlg-password");

        if(!userInput || !passwordInput)
            throw new Error("#dlg-user or #dlg-password is not found in login.html");

        const user = userInput.value;
        const password = passwordInput.value;

        return { user, password };
    }

    private async validateInputs(inputs: LoginFields): Promise<boolean>{
        let valid = true;

        //check backend if it exists and correct

        return valid;
    }
}
customElements.define("login-dialog", LoginDialog, { extends: 'dialog' });