import { MyRecipes } from "../../../pages/my-recipes/my-recipes.js";
import { Explore } from "../../../pages/explore/explore.js";

export enum Filters{
    None = 0,
    Breakfast = 1,
    Lunch = 2,
    Dinner = 3,
    Pasta = 4,
    Salad = 5,
    Protien = 6,
    Side = 7,
    Snack = 8,
    Food = 9,
    Bookmark = 10
}

export class FilterPopUp extends HTMLElement{

    private initialized: boolean = false;
    private shadow = this.attachShadow({ mode:"open"}); 
    private _parentComp: MyRecipes | Explore | null = null;
    private currentFilter: Filters = Filters.None;

    private buttons: HTMLButtonElement[] = [];

    async connectedCallback(){
        if(this.initialized) return;

        const [html, css] = await Promise.all([
            fetch(new URL("./filter.html", import.meta.url)).then(r => r.text()),
            fetch(new URL("./filter.css", import.meta.url)).then(r => r.text())
        ]);

        this.shadow.innerHTML = `
            <link rel="stylesheet" href="styles.css">
            <style>${css}</style>
            ${html}`
        ;

        this.initializeHTMLElements();

        this.initialized = true;
    }

    private initializeHTMLElements(){
        const btnId = ["breakfast", "lunch", "dinner", "pasta", "salad", "protien", "side", "snack", "food", "bookmarked"];

        for(let i = 0; i < btnId.length; i++){
            const temp = this.shadow.getElementById(btnId[i]!) as HTMLButtonElement;

            if(!temp)
                throw new Error(`#${btnId[i]} not found`);

            temp.addEventListener("click", () => this.onClick(i));
            this.buttons.push(temp);
        }

    }

    private onClick(filter: Filters){
        if(!this.parentComp || filter > 10) return;

        if(this.currentFilter - 1 >= 0)
            this.buttons[this.currentFilter - 1]!.classList.remove("toggled");

        this.currentFilter = filter + 1 === this.currentFilter ? 0 : filter + 1;
        this.parentComp?.filterRecipeList?.(this.currentFilter!);

        if(this.currentFilter - 1 > -1)
            this.buttons[filter!]!.classList.add("toggled");

    }

    set parentComp(parentComp: MyRecipes | Explore){
        this._parentComp = parentComp;
    }

    get parentComp(): MyRecipes | Explore | null {
        return this._parentComp;
    }
}
customElements.define('filter-popup', FilterPopUp);