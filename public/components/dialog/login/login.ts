import { BackendExtensionService } from "../../../backend-extension-service.js";

interface LoginFields{
    email: string,
    password: string
}

export class LoginDialog extends HTMLElement{

    private initialized: boolean = false;
    private dialog!: HTMLDialogElement;
    private backendExension: BackendExtensionService = new BackendExtensionService();

    private responseP!: HTMLParagraphElement;

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
        const close = this.querySelector<HTMLButtonElement>("#dlg-close");
        const dialog = this.querySelector('dialog');

        const responseP = this.querySelector<HTMLParagraphElement>("#dlg-response")

        if(!submit || !close || !dialog || !responseP){
            throw new Error("#dlg-submit, #dlg-close, #dlg-response, or dialog not found in login.html");
        }

        submit.addEventListener("click", () => this.loginAccount());
        close.addEventListener("click", () => this.close());

        this.dialog = dialog;
        this.responseP = responseP;
    }

    private async loginAccount(){
        const inputs = this.gatherInputs();

        const valid = await this.validateInputs(inputs);

        if(!valid){
            this.responseP.textContent = "Wrong Email or Password";
            this.responseP.style.color = "var(--close-bg)";
        } else {
            this.responseP.textContent = "Successfully Logged In";
            this.responseP.style.color = "green";
            await delay(1500);
            this.close();
            window.location.reload();
        }

        function delay(ms: number){
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    }

    private gatherInputs(): LoginFields{
        const emailInput = this.querySelector<HTMLInputElement>("#dlg-user");
        const passwordInput = this.querySelector<HTMLInputElement>("#dlg-password");

        if(!emailInput || !passwordInput)
            throw new Error("#dlg-user or #dlg-password is not found in login.html");

        const email = emailInput.value;
        const password = passwordInput.value;

        return { email, password };
    }

    private async validateInputs(inputs: LoginFields): Promise<boolean>{
        let valid = false;

        if(await this.backendExension.loginUser(inputs)){
            valid = true;
        }

        return valid;
    }

    public close(){
        this.dialog.close();
    }

    public async showModal(){
        if(!this.initialized) await this.connectedCallback();

        this.dialog.showModal();
    }
}
customElements.define('login-dialog', LoginDialog);