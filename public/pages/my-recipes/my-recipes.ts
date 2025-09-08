export class MyRecipes extends HTMLElement{

    private shadow = this.attachShadow({ mode:"open" });

    private divList!: HTMLDivElement;

    async connectedCallback(){
        const [html, css] = await Promise.all([
            fetch(new URL("./my-recipes.html", import.meta.url)).then(r => r.text()),
            fetch(new URL("./my-recipes.css", import.meta.url)).then(r => r.text())
        ]);

        this.shadow.innerHTML = 
            `<link rel="stylesheet" href="styles.css">
            <style>${css}</style>
            ${html}`;

        this.initializeHTMLElements();
    }

    private initializeHTMLElements(): void{
        const divList = this.shadow.getElementById("#recipe-list") as HTMLDivElement;

        if(!divList){
            throw new Error("#recipe-list not found");
        }

        this.divList = divList;
    }


}
customElements.define("my-recipes", MyRecipes)