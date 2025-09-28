

export class Home extends HTMLElement{

    private shadow = this.attachShadow({ mode: "open" });

    async connectedCallback(){
        const [html, css] = await Promise.all([
            fetch(new URL("./home.html", import.meta.url)).then(r => r.text()),
            fetch(new URL("./home.css", import.meta.url)).then(r => r.text())
        ]);

        this.shadow.innerHTML = `
            <link rel="stylesheet" href="styles.css">
            <style>${css}</style>
            ${html}`;

        //this.initializeHTMLElements();
    }

    private initializeHTMLElements(): void{
        
    }

    

}
customElements.define("home-page", Home);