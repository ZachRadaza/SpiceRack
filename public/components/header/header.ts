import { BackendExtensionService } from "../../backend-extension-service.js";
import { LoginDialog } from "../dialog/login/login.js";

export class Header extends HTMLElement{
    private shadow = this.attachShadow({ mode:"open" });
    private initialized: boolean = false;

    private button!: HTMLButtonElement;
    private userName!: HTMLHeadingElement;
    private dropdown!: HTMLDivElement;
    private accBtn!: HTMLButtonElement;
    private logBtn!: HTMLButtonElement;

    private backendService: BackendExtensionService = new BackendExtensionService();

    async connectedCallback(){
        if(this.initialized) return;
        const [html, css] = await Promise.all([
            fetch(new URL("./header.html", import.meta.url)).then(r => r.text()),
            fetch(new URL("./header.css", import.meta.url)).then(r => r.text())
        ]);

        this.shadow.innerHTML = `
            <link rel="stylesheet" href="styles.css">
            <style>${css}</style>
            ${html}
        `;

        this.initializeHTMLComponents();

        this.initialized = true;
    }

    private async initializeHTMLComponents(){
        const button = this.shadow.getElementById("profile") as HTMLButtonElement;
        const userName = this.shadow.getElementById("username") as HTMLHeadingElement;
        const dropdown = this.shadow.getElementById("profile-dropdown") as HTMLDivElement;
        const accBtn = this.shadow.getElementById("dropdown-acc-btn") as HTMLButtonElement;
        const logBtn = this.shadow.getElementById("dropdown-log-btn") as HTMLButtonElement;
    
        if(!button || !userName || !dropdown || !accBtn || !logBtn) 
            throw new Error("#profile, #username, #profile-dropdown, #dropdown-acc-btn, or #dropdown-log-btn does not exist in header component");


        this.button = button;
        this.userName = userName;
        this.dropdown = dropdown;
        this.logBtn = logBtn;
        this.accBtn = accBtn;


        this.button.addEventListener("click", () => this.profileClick());
        this.logBtn.addEventListener("click", () => this.logClick(this.logBtn.classList.contains("logout")));

        const { id } = await this.backendService.checkClientUser();
        const user = await this.backendService.getUser(id);

        if(user){
            this.userName.textContent = user.data.username;

            this.logBtn.classList.add("logout");
            this.logBtn.textContent = "Log-out";
        }
    }

    private profileClick(){
        if(this.button.classList.contains("toggled")) this.button.classList.remove("toggled");
        else this.button.classList.add("toggled");

        if(this.dropdown.classList.contains("hidden")) this.dropdown.classList.remove("hidden");
        else this.dropdown.classList.add("hidden");
    }

    private async logClick(logout: boolean){
        if(logout){
            const success = await this.backendService.logoutUser();

            if(success){
                window.location.reload();
            }
        } else {
            const dialog = document.createElement('login-dialog') as LoginDialog;

            document.body.appendChild(dialog);
            dialog.showModal();
        }
    }

    private accountClick(){

    }
}
customElements.define('header-component', Header);