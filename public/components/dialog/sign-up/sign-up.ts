import { BackendExtensionService } from "../../../backend-extension-service.js";

interface SignUpFields {
    username: string,
    email: string,
    password: string
}

export class SignUpDialog extends HTMLElement{

    private initialized: boolean = false;
    private dialog!: HTMLDialogElement;
    private backendExtension: BackendExtensionService = new BackendExtensionService();

    private responseP!: HTMLParagraphElement;
    private userP!: HTMLParagraphElement;
    private emailP!: HTMLParagraphElement;
    private passwordP!: HTMLParagraphElement;

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
        const close = this.querySelector<HTMLButtonElement>("#dlg-close");
        const dialog = this.querySelector<HTMLDialogElement>("dialog");

        const responseP = this.querySelector<HTMLParagraphElement>("#dlg-response");
        const userP = this.querySelector<HTMLParagraphElement>("#dlg-username-response");
        const emailP = this.querySelector<HTMLParagraphElement>("#dlg-email-response");
        const passwordP = this.querySelector<HTMLParagraphElement>("#dlg-password-response");

        if(!submit || !close || !dialog || !responseP || !userP || !emailP || !passwordP){
            throw new Error("#dlg-submit, #dlg-close, dialog, #dlg-response, or response elements not found in sign-up.html");
        }

        submit.addEventListener("click", () => this.createAccount());
        close.addEventListener("click", () => this.close());

        this.dialog = dialog;
        this.responseP = responseP;
        this.userP = userP;
        this.emailP = emailP;
        this.passwordP = passwordP;
    }

    private async createAccount(){
        const inputs = this.gatherInputs();

        const validInputs = await this.validateInputs(inputs);

        if(validInputs){
            const signUp = await this.backendExtension.signUpUser(inputs);
            this.responseP.textContent = "";
            this.responseP.className = "";

            if(!signUp) {
                this.responseP.textContent = "Server Error Has Occured";
                this.responseP.classList.add("failure");
            } else {
                this.responseP.textContent = "Successfully Created an Account";
                this.responseP.classList.add("success");

                this.delay(1500);
                await this.loginUser(inputs);
            }
        } 
    }

    private async loginUser(cred: Omit<SignUpFields, "username">){
        const login = await this.backendExtension.loginUser(cred);

        if(login){
            this.responseP.textContent = "Successfully Logged In";
            this.responseP.style.color = "green";
            await this.delay(1500);
            this.close();
        } else {
            this.responseP.textContent = "Wrong Email or Password";
            this.responseP.style.color = "var(--close-bg)";
        }

    }

    private delay(ms: number){
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private gatherInputs(): SignUpFields{
        const usernameInput = this.querySelector<HTMLInputElement>("#dlg-username");
        const emailInput = this.querySelector<HTMLInputElement>("#dlg-email");
        const passwordInput = this.querySelector<HTMLInputElement>("#dlg-password");

        if(!usernameInput || !emailInput || !passwordInput){
            throw new Error("#dlg-username, #dlg-email, #dlg-password not found in sign-up.html");
        }

        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        return { username, email, password };
    }

    private async validateInputs(inputs: SignUpFields): Promise<boolean>{
        let valid: boolean = true;

        this.userP.textContent = "";
        this.emailP.textContent = "";
        this.passwordP.textContent = "";

        const userValid = await validateUsername(inputs.username, this.backendExtension);
        const emailValid = await validateEmail(inputs.email, this.backendExtension);
        const passwordValid = await validatePassword(inputs.password);

        if(!userValid){
            this.userP.textContent = "Username Already Taken";

            valid = false;
        }

        if(!emailValid){
            this.emailP.textContent = "Email Already Taken";

            valid = false;
        }

        if(!passwordValid){
            this.passwordP.textContent = "Password Must Be Atleast 8 Characters";

            valid = false;
        }

        return valid;

        async function validateUsername(username: string, extension: BackendExtensionService): Promise<boolean>{
            let valid = true;
            const forbidden = ["fuck", "shit", "bitch", "admin", "penis", "dick", "boob", "vagina"];
            
            valid = await extension.checkUsername(username);

            for(let i = 0; i < forbidden.length; i++){
                if(username.toLocaleLowerCase().includes(forbidden[i]!)){
                    valid = false;
                    break;
                }
            }

            return valid;
        }

        async function validateEmail(email: string, extension: BackendExtensionService): Promise<boolean>{
            let valid = await extension.checkEmail(email);

            return valid;
        }

        function validatePassword(password: string): boolean{
            let valid = true;

            if(password.length < 8) valid = false;

            return valid;
        }
    }

    public close(){
        this.dialog.close();
    }

    public async showModal(){
        if(!this.initialized) await this.connectedCallback();

        this.dialog.showModal();
    }
}
customElements.define('sign-up-dialog', SignUpDialog);