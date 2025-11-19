import { BackendExtensionService } from "../../../backend-extension-service.js";

export class AccountDialog extends HTMLElement{

    private initialized: boolean = false;
    private extensionService: BackendExtensionService = new BackendExtensionService();

    private dialog!: HTMLDialogElement;
    private username!: HTMLHeadingElement;
    private email!: HTMLHeadingElement;
    private numRecipe!: HTMLHeadingElement;
    private closeBtn!: HTMLButtonElement;

    async connectedCallback(){
        if(this.initialized) return;

        const [html, css] = await Promise.all([
            fetch(new URL("./account.html", import.meta.url)).then(r => r.text()),
            fetch(new URL("./account.css", import.meta.url)).then(r => r.text())
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
        const dialog = this.querySelector('dialog');
        const username = this.querySelector<HTMLHeadingElement>("#dlg-acc-username");
        const email = this.querySelector<HTMLHeadingElement>("#dlg-acc-email");
        const numRecipe = this.querySelector<HTMLHeadingElement>("#dlg-acc-recipes");
        const close = this.querySelector<HTMLButtonElement>("#dlg-close");

        if(!dialog || !username || !email || !numRecipe || !close)
            throw new Error("dialog, #dlg-acc-username, #alg-acc-email, or #dlg-acc-recipes nor found in account.ts");

        this.dialog = dialog;
        this.username = username;
        this.email = email;
        this.numRecipe = numRecipe;
        this.closeBtn = close;

        this.closeBtn.addEventListener("click", () => this.close());

        this.fetchAccountInfo();
    }

    private async fetchAccountInfo(){
        const { id } = await this.extensionService.checkClientUser();
        const { data } = await this.extensionService.getUser(id);

        if(!data)
            throw new Error("Error fetching user data");

        this.username.textContent = data.username;
        this.email.textContent = data.email;
        this.numRecipe.textContent = data.recipes.length;
        //console.log(data.recipes);
    }

    public close(){
        this.dialog.close();
    }

    public async showModal(){
        if(!this.initialized) await this.connectedCallback();

        this.dialog.showModal();
    }
}
customElements.define('account-dialog', AccountDialog);