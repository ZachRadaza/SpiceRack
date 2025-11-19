import { RecipeCategories, MealTime, MealType } from "../../../main.js";
import { MyRecipes } from "../../../pages/my-recipes/my-recipes.js";
import { Recipe, RecipeFields } from "../recipe-mini/recipe.js";
import { BackendExtensionService } from "../../../backend-extension-service.js";

export class RecipeDialog extends HTMLElement{

    private _id!: string;
    private _name: string = "";
    private _procedures: string[] = [""];
    private _ingredients: string[] = [""];
    private _imageLink: string = "";
    private _accountName: string = "Developer";
    private _ownerId: string = "";
    private recipeCategories: RecipeCategories = new RecipeCategories();
    private _recipe!: Recipe;
    private _myRecipe!: MyRecipes;
    private _bookmarked: boolean = false;
    private initialized: boolean = false;
    private brandNew: boolean = true;

    private editable: boolean = true;

    private mealTimeBtn!: HTMLButtonElement;
    private mealTypeBtn!: HTMLButtonElement;
    private bmBtn!: HTMLButtonElement;

    private nameInput!: HTMLTextAreaElement;
    private procedureList!: HTMLOListElement;
    private ingredientsList!: HTMLUListElement;
    private imageImg!: HTMLImageElement;
    private imageInput!: HTMLInputElement;
    private dialog!: HTMLDialogElement;

    private extensionService: BackendExtensionService = new BackendExtensionService();

    async connectedCallback(){
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
        this.update();
    }

    private async initializeHTMLElements() {
        const nameInput = this.querySelector<HTMLTextAreaElement>("#dlg-name");
        const procedureList = this.querySelector<HTMLOListElement>("#dlg-procedures");
        const ingredientsList = this.querySelector<HTMLUListElement>("#dlg-ingredients");
        const imageImg = this.querySelector<HTMLImageElement>("#dlg-image-cont img");
        const imageInput = this.querySelector<HTMLInputElement>("#dlg-image-link-cont input");

        const timeBtn = this.querySelector<HTMLButtonElement>("#dlg-meal-time");
        const typeBtn = this.querySelector<HTMLButtonElement>("#dlg-meal-type");
        const bmBtn = this.querySelector<HTMLButtonElement>("#dlg-bookmark");
        
        const deleteBtn = this.querySelector<HTMLButtonElement>("#dlg-delete");
        const saveBtn = this.querySelector<HTMLButtonElement>("#dlg-save");
        const closeBtn = this.querySelector<HTMLButtonElement>("#dlg-close");
        const dialog = this.querySelector<HTMLDialogElement>('dialog');

        if(!timeBtn || !typeBtn || !bmBtn || !nameInput || !procedureList || !ingredientsList || !imageImg || !imageInput || !dialog){
            throw new Error("dialog, #dlg-meal-time, #dlg-meal-type, #dlg-name, #dlg-procedures, #dlg-ingredients, and #dlg-image-cont img/input not found in recipe-dialog");
        }

        this.nameInput = nameInput;
        this.procedureList = procedureList;
        this.ingredientsList = ingredientsList;
        this.imageImg = imageImg;
        this.imageInput = imageInput;

        this.mealTimeBtn = timeBtn;
        this.mealTypeBtn = typeBtn;
        this.bmBtn = bmBtn;
        this.dialog = dialog;

        const mTime = Object.values(MealTime);
        const mType = Object.values(MealType);
        this.mealTimeBtn.addEventListener("click", () => this.mealCategoryChange(mTime, this.mealTimeBtn));
        this.mealTypeBtn.addEventListener("click", () => this.mealCategoryChange(mType, this.mealTypeBtn));
        this.bmBtn?.addEventListener("click", () => this.bookmarkRecipe());
        deleteBtn?.addEventListener("click", () => this.delete());
        saveBtn?.addEventListener("click", () => this.save());
        closeBtn?.addEventListener("click", () => this.close());
    }

    //setters
    public setAllFields(fields: RecipeFields, recipe: Recipe, editable: boolean = false):void {
        this._id = fields.id;
        this._name = fields.name;
        this._ingredients = fields.ingredients;
        this._procedures = fields.procedures;
        this._imageLink = fields.imageLink || "";
        this._accountName = fields.accountName || "";
        this._ownerId = fields.ownerId;
        this.recipeCategories.mealTime = fields.mealTime;
        this.recipeCategories.mealType = fields.mealType;
        this._bookmarked = fields.bookmarked;
        this._recipe = recipe;

        this.brandNew = false;
        this.editable = editable;
        this.update();
    }

    public set myRecipes(r: MyRecipes){
        this._myRecipe = r;
    }

    //getters
    public get idNumber(){
        return this._id;
    }

    public get name(){
        return this._name;
    }

    public get procedures(){
        return this._procedures;
    }

    public get ingredients(){
        return this._ingredients;
    }

    public get imageLink(){
        return this._imageLink;
    }

    public get accountName(){
        return this._accountName;
    }

    public get ownerId(){
        return this._ownerId;
    }

    public get mealTime(){
        return this.recipeCategories.mealTime;
    }

    public get mealType(){
        return this.recipeCategories.mealType;
    }

    public get bookmarked(){
        return this._bookmarked;
    }

    //methods
    private update(){
        if(!this.initialized) return;

        //set recipe categories
        this.updateMealComponents();

        this.addIngProLine(this.ingredientsList);
        this.addIngProLine(this.procedureList);
        requestAnimationFrame(() => {
            this.querySelectorAll("textarea").forEach((el) => {
                el.style.height = "auto";
                el.style.height = el.scrollHeight + "px";
            });
        });

        if(this.brandNew) return;

        this.nameInput.value = this._name;
        if(this._bookmarked) this.bmBtn.classList.add("checked");

        //update creator tag
        this.updateCreatorTag();

        //add ingredients and procedures
        this.updateIngPro();

        //add image
        if(!!this._imageLink){
            this.imageInput.value = this._imageLink;
            this.imageImg.src = this._imageLink;
        }

        //disable components
        if(!this.editable) this.disableComponents();
    }

    private updateCreatorTag(){
        const span = this.querySelector<HTMLSpanElement>("#dlg-creator");
        if(!span) throw new Error("#dlg-creator not found");

        span.textContent = this._accountName + "'s Recipe";
    }

    //updates meal time an type to match color
    private updateMealComponents(): void{
        const edges = this.querySelectorAll<HTMLDivElement>(".edge");


        if(!edges){
            throw new Error(".edge not found");
        }

        this.mealTimeBtn.textContent = this.recipeCategories.mealTime.toUpperCase();
        this.mealTimeBtn.classList.remove("lunch");
        this.nameInput.classList.remove("lunch");
        this.mealTimeBtn.classList.add(this.recipeCategories.mealTime);
        this.nameInput.classList.add(this.recipeCategories.mealTime);

        this.mealTypeBtn.textContent = this.recipeCategories.mealType.toUpperCase();
        this.mealTypeBtn.classList.remove("food");
        edges.forEach(e => {
            e.classList.remove("food");
            e.classList.add(this.recipeCategories.mealType);
        });

        this.mealTypeBtn.classList.add(this.recipeCategories.mealType);
    }

    //updates Ingredients and Procedures
    private updateIngPro(): void{
        this.updateIngProHelper(this._procedures, this.procedureList);
        this.updateIngProHelper(this._ingredients, this.ingredientsList);
        this.nameInput.focus();
    }

    private updateIngProHelper(list: string[], elementList: HTMLOListElement | HTMLUListElement): void{
        if(this.brandNew) return;
        elementList.replaceChildren();

        list.forEach( i => {
            elementList.appendChild(this.ingProInput(elementList, i));
        });

        if(this.editable) elementList.appendChild(this.addButton(elementList));
    }

    private async disableComponents(): Promise<void>{
        this.bmBtn.disabled = true;
        this.mealTimeBtn.disabled = true;
        this.mealTypeBtn.disabled = true;

        const saveBtn = this.querySelector<HTMLButtonElement>("#dlg-save");
        if(saveBtn){
            saveBtn.textContent = "Save to Recipes";

            const user = await this.extensionService.checkClientUser();
            if(!user.id){
                saveBtn.disabled = true;
            }
        }

        this.nameInput.disabled = true;

        const deleteBtn = this.querySelector<HTMLButtonElement>("#dlg-delete");
        if(!deleteBtn) throw new Error("#dlg-delete not found");
        deleteBtn.remove();
    }

    private removeButton(): HTMLButtonElement{
        const remBtn = document.createElement("button");

        remBtn.textContent = "x";
        remBtn.type = "button";
        remBtn.classList.add("dlg-remove-li")

        remBtn.addEventListener("click", () => remBtn.parentElement?.remove());

        return remBtn;
    }

    private addButton(list: HTMLUListElement | HTMLOListElement): HTMLButtonElement{
        const addBtn = document.createElement("button");

        addBtn.textContent = "+";
        addBtn.type = "button";
        addBtn.classList = "dlg-add-btn";

        addBtn.addEventListener("click", () => {
            const addBtn = list.lastElementChild;
            list.removeChild(addBtn!);
            
            this.addIngProEnd(list);
        });

        return addBtn;
    }

    private mealCategoryChange(category: MealTime[] | MealType[], btn: HTMLButtonElement):void {
        let oldClass: string = "";
        let newClass: string = "";

        if(category.length <= 0) return;

        for(let i = 0; i < category.length; i++){
            if(category[i]!.toUpperCase() === btn.textContent.toUpperCase()){
                oldClass = category[i] as string;

                i++;
                if(i >= category.length) i = 0;
                btn.textContent = category[i]!.toUpperCase();
                newClass = category[i] as string;
                break;
            }
        }

        btn.classList.remove(oldClass);
        btn.classList.add(newClass);

        const isMealTypeArray = (arr: (MealTime | MealType)[]): arr is MealType[] =>
            Object.values(MealType).includes(arr[0] as MealType);

        if (isMealTypeArray(category)) {
            const edges = this.querySelectorAll<HTMLDivElement>(".edge");
            edges.forEach(e => {
                if (oldClass) e.classList.remove(oldClass);
                e.classList.add(newClass);
            });

            this.recipeCategories.mealType = newClass.toLowerCase() as MealType;
        } else {
            this.nameInput.classList.remove(oldClass);
            this.nameInput.classList.add(newClass);

            this.recipeCategories.mealTime = newClass.toLowerCase() as MealTime;
        }
    }

    private delete(): void{
        if(!this.brandNew)
            this._myRecipe.deleteRecipe(this._id);

        this.close();
    }

    private save(): void{
        this.pushInputIntoField();

        const recipeFields = {
            id: this._id,
            name: this._name,
            ingredients: this._ingredients,
            procedures: this._procedures,
            imageLink: this._imageLink,
            accountName: this._accountName,
            ownerId: this._ownerId,
            mealTime: this.recipeCategories.mealTime,
            mealType: this.recipeCategories.mealType,
            bookmarked: this._bookmarked,
            mini: false
        };

        if(!this.brandNew){
            this.extensionService.accountUpdateRecipe(recipeFields);
            this._recipe.setAllFields(recipeFields, this.myRecipes);
        } else {
            this._myRecipe.addNewRecipe(recipeFields);
        }

        this.close();
        
    }

    private pushInputIntoField(): void{
        this._name = this.nameInput.value;

        this._procedures.length = 0;
        this.procedureList.querySelectorAll("textarea").forEach(input => {
            this._procedures.push(input.value);
        });

        this._ingredients.length = 0;
        this.ingredientsList.querySelectorAll("textarea").forEach(input => {
            this._ingredients.push(input.value);
        });

        this._imageLink = this.imageInput.value;
        this._bookmarked = this.bmBtn.classList.contains("checked");
    }

    private addIngProLine(elementList: HTMLUListElement | HTMLOListElement): void{
        const addBtn = elementList.lastElementChild;
        elementList.removeChild(addBtn!);

        const listOfElements = Array.from(elementList.children) as Element[];
        if(listOfElements.length <= 0){
            this.addIngProEnd(elementList);
            return;
        }

        let indexInput: number = 0;

        for(let i = 0; i < listOfElements.length; i++){
            const input = listOfElements[i]!.querySelector<HTMLTextAreaElement>("textarea.current-focus");
            if(input){
                input.blur();
                indexInput = i;
                break;
            }
        }

        if(listOfElements.length <= indexInput + 1){
            this.addIngProEnd(elementList);
            return;
        }

        let temp: Element[] = [];
        for(let i = indexInput + 1; i < listOfElements.length; i++){
            const liElement = elementList.removeChild(listOfElements[i] as Element);
            temp.push(liElement);
        }

        //to focus
        const newIngPro = this.ingProInput(elementList)
        elementList.appendChild(newIngPro);
        const newIngProInput = newIngPro.querySelector<HTMLTextAreaElement>("textarea");
        newIngProInput?.focus();

        while(temp.length > 0){
            elementList.appendChild(temp.shift() as Element);
        }

        elementList.appendChild(this.addButton(elementList));
    }

    private addIngProEnd(elementList: HTMLOListElement | HTMLUListElement){
        const newLi = this.ingProInput(elementList);
        const input = newLi.querySelector<HTMLTextAreaElement>("textarea");
        input!.rows = 1;

        input!.addEventListener("input", () => {
            const needsResize = input!.scrollHeight > input!.clientHeight;
            if (needsResize) {
                input!.style.height = "auto";
                input!.style.height = input!.scrollHeight + "px";
            }
        });

        elementList.appendChild(newLi);
        input?.focus();
        elementList.appendChild(this.addButton(elementList));
    }

    private removeIngProHelper(elementList: HTMLOListElement | HTMLUListElement){
        const listOfElements = Array.from(elementList.children) as Element[];
        let found = false;

        for(let i = listOfElements.length - 1; i >= 0; i--){
            const input = listOfElements[i]!.querySelector<HTMLTextAreaElement>("textarea");
            if(found) {
                input?.focus();
                break;
            }

            if(input?.classList.contains("current-focus")){
                input.blur();
                found = true;
            }
        }
    }

    private ingProInput(elementList: HTMLUListElement | HTMLOListElement, inside: string = ""): HTMLLIElement{
        const input = document.createElement("textarea");
        input.rows = 1;
        input.classList.add("body");
        input.placeholder = elementList instanceof HTMLUListElement ? "Ingredient" : "Procedure";
        input.value = inside;
        const li = document.createElement("li");
        li.appendChild(input);

        if(this.editable) li.appendChild(this.removeButton());
        else input.disabled = true;

        input.addEventListener("keydown", (event: KeyboardEvent) => {
            if(event.key === 'Enter'){
                event.preventDefault();
                this.addIngProLine(elementList);
            }
            if(event.key === "Backspace" && input.value === ""){
                this.removeIngProHelper(elementList);

                li.remove();
            }
        });

        input.addEventListener("focus", () => {
            input.classList.add("current-focus");
        });
        
        input.addEventListener("blur", () => {
            input.classList.remove("current-focus");
        });

        input.addEventListener("input", () => {
            const needsResize = input.scrollHeight > input.clientHeight;
            if (needsResize) {
                input.style.height = "auto";
                input.style.height = input!.scrollHeight + "px";
            }
        });

        return li;
    }

    //make fancier
    private bookmarkRecipe(): void{
        this._bookmarked = !this._bookmarked;
        
        if(this._bookmarked)
            this.bmBtn.classList.add("checked");
        else
            this.bmBtn.classList.remove("checked");
    }

    public close(){
        this.dialog.close();
    }

    public async showModal(){
        if(!this.initialized) await this.connectedCallback();

        this.dialog.showModal();
    }
}
customElements.define('recipe-dialog', RecipeDialog);