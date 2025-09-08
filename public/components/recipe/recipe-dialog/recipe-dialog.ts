import { RecipeCategories, MealTime, MealType } from "../../../main.js";
import { Recipe, RecipeFields } from "../recipe-mini/recipe.js";

export class RecipeDialog extends HTMLDialogElement{

    private _name: string = "";
    private _procedures: string[] = [""];
    private _ingredients: string[] = [""];
    private _imageLink: string = "";
    private _accountName: string = "Developer";
    private recipeCategories: RecipeCategories = new RecipeCategories();
    private _recipe!: Recipe;
    private _bookmarked: boolean = false;
    private initialized: boolean = false;
    private brandNew: boolean = true;

    private mealTimeBtn!: HTMLButtonElement;
    private mealTypeBtn!: HTMLButtonElement;
    private bmInput!: HTMLInputElement;

    private nameInput!: HTMLInputElement;
    private procedureList!: HTMLOListElement;
    private ingredientsList!: HTMLUListElement;
    private imageImg!: HTMLImageElement;
    private imageInput!: HTMLInputElement;



    async connnectedCallback(){
        if(this.initialized) return;

        const [html, css] = await Promise.all([
            fetch(new URL("./recipe-dialog.html", import.meta.url)).then(r => r.text()),
            fetch(new URL("./recipe-dialog.css", import.meta.url)).then(r => r.text())
        ]);

        this.innerHTML = `
            <link rel="stylesheet" href="styles.css">
            <style>${css}</style>
            ${html}`
        ;

        this.initializeHTMLElements();

        this.initialized = true;
    }

    private initializeHTMLElements() {
        const nameInput = this.querySelector<HTMLInputElement>("#dlg-name");
        const procedureList = this.querySelector<HTMLOListElement>("#dlg-procedures");
        const ingredientsList = this.querySelector<HTMLUListElement>("#dlg-ingredients");
        const imageImg = this.querySelector<HTMLImageElement>("#dlg-image-cont img");
        const imageInput = this.querySelector<HTMLInputElement>("#dlg-image-cont input");

        const timeBtn = this.querySelector<HTMLButtonElement>("#dlg-meal-time");
        const typeBtn = this.querySelector<HTMLButtonElement>("#dlg-meal-type");
        const bmInput = this.querySelector<HTMLInputElement>("#dlg-bookmark");
        
        const saveBtn = this.querySelector<HTMLButtonElement>("#dlg-save");
        const closeBtn = this.querySelector<HTMLButtonElement>("#dlg-close");
        const addIngBtn = this.querySelector<HTMLButtonElement>("#ingredients button");
        const addProBtn = this.querySelector<HTMLButtonElement>("#procedures button");

        if(!timeBtn || !typeBtn || !bmInput || !nameInput || !procedureList || !ingredientsList || !imageImg || !imageInput){
            throw new Error("#dlg-meal-time, #dlg-meal-type, #dlg-name, #dlg-procedures, #dlg-ingredients, and #dlg-image-cont img/input not found in recipe-dialog");
        }

        this.nameInput = nameInput;
        this.procedureList = procedureList;
        this.ingredientsList = ingredientsList;
        this.imageImg = imageImg;
        this.imageInput = imageInput;

        this.mealTimeBtn = timeBtn;
        this.mealTypeBtn = typeBtn;
        this.bmInput = bmInput;

        this.mealTimeBtn.addEventListener("click", () => this.mealCategoryChange(Object.values(MealTime), this.mealTimeBtn));
        this.mealTypeBtn.addEventListener("click", () => this.mealCategoryChange(Object.values(MealType), this.mealTimeBtn));
        this.imageInput.addEventListener("change", () => this.changeImage());
        this.bmInput?.addEventListener("change", () => this.bookmarkRecipe());
        saveBtn?.addEventListener("click", () => this.save());
        closeBtn?.addEventListener("click", () => this.close());
        addIngBtn?.addEventListener("click", () => this.addIngProLine(this.ingredientsList));
        addProBtn?.addEventListener("click", () => this.addIngProLine(this.procedureList));

    }

    public setAllFields(fields: RecipeFields, recipe: Recipe):void {
        this._name = fields.name;
        this._ingredients = fields.ingredients;
        this._procedures = fields.procedures;
        this._imageLink = fields.imageLink;
        this._accountName = fields.accountName;
        this.recipeCategories.mealTime = fields.mealTime;
        this.recipeCategories.mealType = fields.mealType;
        this._bookmarked = fields.bookmarked;
        this._recipe = recipe;

        this.brandNew = false;
        this.update();
    }

    //methods
    private update(){
        if(this.brandNew) return;

        this.nameInput.textContent = this._name;
        if(this._bookmarked) this.bmInput.checked = true;

        //set recipe categories
        this.mealTimeBtn.textContent = this.recipeCategories.mealTime.toUpperCase();
        this.mealTimeBtn.classList.add(this.recipeCategories.mealTime);
        this.mealTypeBtn.textContent = this.recipeCategories.mealType.toUpperCase();
        this.mealTypeBtn.classList.add(this.recipeCategories.mealType);

        //add ingredients and procedures
        this.updateIngPro();

        //add image
        if(!!this._imageLink){
            this.imageImg.src = this._imageLink;
        }
    }

    //updates Ingredients and Procedures
    private updateIngPro(): void{
        this.updateIngProHelper(this._ingredients, this.ingredientsList);
        this.updateIngProHelper(this._procedures, this.procedureList);

    }

    private updateIngProHelper(list: string[], elementList: HTMLOListElement | HTMLUListElement): void{
        const addBtn = elementList.lastChild;
        elementList.replaceChildren();

        list.forEach( i => {
            const input = document.createElement("input");
            input.value = i;
            input.classList.add("body");

            const li = document.createElement("li");
            li.appendChild(input);
            li.appendChild(this.removeButton());
            elementList.appendChild(li);
        });

        elementList.appendChild(addBtn!);
    }

    private removeButton(): HTMLButtonElement{
        const remBtn = document.createElement("button");

        remBtn.textContent = "x";
        remBtn.type = "button";
        remBtn.classList.add("dlg-remove-li")

        remBtn.addEventListener("click", () => {
            remBtn.parentElement?.remove;
        });

        return remBtn;
    }

    private mealCategoryChange(category: MealTime[] | MealType[], btn: HTMLButtonElement):void {
        let oldClass: string = "";
        let newClass: string = "";
        
        for(let i = 0; i < category.length; i++){
            if(category.length <= 0) return;

            if(category[i]!.toUpperCase() === btn.textContent.toUpperCase()){
                oldClass = category[i] as string;

                if(i + 1 <= category.length) i = 0;
                btn.textContent = category[i]!.toUpperCase();
                newClass = category[i] as string;
                break;
            }
        }

        btn.classList.remove(oldClass);
        btn.classList.add(newClass);

        if(category.length > 0 && category[0] as MealType){
            const edges = this.querySelectorAll<HTMLDivElement>(".edge");
            edges.forEach( e => {
                e.classList.remove(oldClass);
                e.classList.add(newClass);
            });
            this.recipeCategories.mealType = newClass.toLowerCase() as MealType;
        } else {
            const bg = this.querySelector<HTMLDivElement>(".dlg-main");
            bg?.classList.remove(oldClass);
            bg?.classList.add(newClass);

            this.nameInput.classList.remove(oldClass);
            this.nameInput.classList.add(newClass);
            this.recipeCategories.mealTime = newClass.toLowerCase() as MealTime;
        }
    }

    private save(): void{
        this._recipe.setAllFields({
            name: this._name,
            ingredients: this._ingredients,
            procedures: this._procedures,
            imageLink: this._imageLink,
            accountName: this._accountName,
            mealTime: this.recipeCategories.mealTime,
            mealType: this.recipeCategories.mealType,
            bookmarked: this._bookmarked,
            mini: this._recipe.mini
        });

        this.close();
    }

    private addIngProLine(elementList: HTMLUListElement | HTMLOListElement): void{
        const addBtn = elementList.lastChild as ChildNode;
        elementList.removeChild(addBtn);

        const input = document.createElement("input");
        input.classList.add("body");

        const li = document.createElement("li");
        li.appendChild(input);
        li.appendChild(this.removeButton());

        elementList.appendChild(li);
        elementList.appendChild(addBtn);
    }

    //make fancier
    private bookmarkRecipe(): void{
        this._bookmarked = !this._bookmarked;
        this.bmInput.checked = this._bookmarked;
    }

    private changeImage(){
        const file = this.imageInput.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = e => {
            this.imageImg.src = e.target?.result as string;
            this.imageInput.style.display = "block"; // show image
        };
        reader.readAsDataURL(file); // convert file to base64 string
        this._imageLink = reader.result as string; 
    }
}
customElements.define("recipe-dialog", RecipeDialog);