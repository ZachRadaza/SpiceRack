import { RecipeCategories, MealTime, MealType } from "../../../main.js";
import { MyRecipes } from "../../../pages/my-recipes/my-recipes.js";
import "../recipe-dialog/recipe-dialog.js";
import { RecipeDialog } from "../recipe-dialog/recipe-dialog.js";

export interface RecipeFields {
    id: number;
    name: string;
    ingredients: string[];
    procedures: string[];
    imageLink: string;
    accountName: string;
    mealTime: MealTime;
    mealType: MealType;
    mini: boolean;
    bookmarked: boolean;
}

export class Recipe extends HTMLElement{

    private shadow = this.attachShadow({ mode:"open"}); 

    private mainContDiv!: HTMLDivElement;
    private edgesDiv!: NodeListOf<HTMLDivElement>;

    private _id!: number;
    private _name: string = "";
    private _procedures: string[] = [""];
    private _ingredients: string[] = [""];
    private _imageLink: string = "";
    private _accountName: string = "Mr.Recommended";
    private recipeCategories: RecipeCategories = new RecipeCategories();
    private _mini: boolean = false; //if mini short version or tall
    private _bookmarked: boolean = false;
    private initialized: boolean = false;
    private _myRecipes!: MyRecipes;
    private _index: number = 0;

    async connectedCallback(){
        if(this.initialized) return;

        const [html, css] = await Promise.all([
            fetch(new URL("./recipe.html", import.meta.url)).then(r => r.text()),
            fetch(new URL("./recipe.css", import.meta.url)).then(r => r.text())
        ]);

        this.shadow.innerHTML = `
            <link rel="stylesheet" href="styles.css">
            <style>${css}</style>
            ${html}`
        ;

        this.initializeHTMLElements();

        this.initialized = true;
        this.update();
    }

    private initializeHTMLElements(): void{
        const mainContDiv = this.shadow.getElementById("recipe-cont") as HTMLDivElement;
        const edgesDiv = this.shadow.querySelectorAll<HTMLDivElement>(".edge");

        if(!mainContDiv){
            throw new Error(".recipe-cont not found")
        }

        if (edgesDiv.length === 0) {
            throw new Error(".edge not found");
        }

        this.mainContDiv = mainContDiv;
        this.edgesDiv = edgesDiv;

        this.shadow.querySelector<HTMLButtonElement>("#expand-btn")?.addEventListener("click", () => this.openRecipeDialog());
        if(this._mini) {
            this.addEventListener("mouseenter", () => this.mainContDiv.classList.remove("condensed"));
            this.addEventListener("mouseleave", () => this.mainContDiv.classList.add("condensed"));
        }
    }

    //setters
    public set idNumber(id: number){
        this._id = id;
    }

    public set name(name: string){
        this._name = name;
        this.update();
    }

    public set procedures(procedures: string[]){
        this._procedures = procedures;
        this.update();
    }

    public set ingredients(ingredients: string[]){
        this._ingredients = ingredients;
        this.update();
    }

    public set imageLink(l: string){
        this._imageLink = l;
        this.update();
    }

    public set accountName(n: string){
        this._accountName = n;
        this.update();
    }

    public set mealTime(t: MealTime){
        this.recipeCategories.mealTime = t;
        this.update();
    }

    public set mealType(t: MealType){
        this.recipeCategories.mealType = t;
        this.update();
    }

    public set mini(m: boolean){
        this._mini = m;
        this.update();
    }

    public set bookmarked(b: boolean){
        this._bookmarked = b;
        this.update();
    }

    public set myrecipes(mr: MyRecipes){
        this._myRecipes = mr;
    }

    public set index(i: number){
        this._index = i;
    }

    public setAllFields(fields: RecipeFields, myRecipes: MyRecipes){
        this._id = fields.id;
        this._name = fields.name;
        this._ingredients = fields.ingredients;
        this._procedures = fields.procedures;
        this._imageLink = fields.imageLink;
        this._accountName = fields.accountName;
        this.recipeCategories.mealTime = fields.mealTime;
        this.recipeCategories.mealType = fields.mealType;
        this._mini = fields.mini;
        this._bookmarked = fields.bookmarked;
        this._myRecipes = myRecipes;

        this.update();
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

    public get mealTime(){
        return this.recipeCategories.mealTime;
    }

    public get mealType(){
        return this.recipeCategories.mealType;
    }

    public get bookmarked(){
        return this._bookmarked;
    }

    public get mini(){
        return this._mini;
    }

    public get index(){
        return this._index;
    }

    //methods
    private update(){
        //updates changed fields
        if(!this.initialized) return;

        enum Elements { eName = 0, eIngredients = 1, eProcedure = 2, eImage = 3, eCreator = 4};
        const ids: string[] = ["#name", "#ingredients", "#procedures", "#image", "#creator"];
        const elements: HTMLElement[] = [];

        for (const id of ids) {
            const el = this.shadow.querySelector<HTMLElement>(id);
            if (!el) throw new Error(`${id} not found`);
            elements.push(el); // el is HTMLElement here
        }

        elements[Elements.eName]!.textContent = this._name;
        
        elements[Elements.eIngredients]!.replaceChildren();
        this._ingredients.forEach(i => {
            const temp = document.createElement('li');
            temp.textContent = i;
            elements[Elements.eIngredients]!.appendChild(temp);
        });

        elements[Elements.eProcedure]!.replaceChildren();
        this._procedures.forEach(p => {
            const temp = document.createElement('li');
            temp.textContent = p;
            elements[Elements.eProcedure]!.appendChild(temp);
        });

        elements[Elements.eImage]!.setAttribute('src', this._imageLink);
        if(!this._imageLink)    elements[Elements.eImage]!.parentElement?.remove;

        elements[Elements.eCreator]!.textContent = this._accountName + "'s Recipe";

        this.updateMealCategory();

    }

    private updateMealCategory():void {
        this.updateMealTime();
        this.updateMealType(); 
    }  

    private updateMealTime(): void{
        const category: MealTime[] = Object.values(MealTime);

        const classList = Array.from(this.mainContDiv.classList);

        for(let i = 0; i < category.length; i++){
            if(classList.includes(category[i] as string)){
                this.mainContDiv.classList.remove(category[i] as string);
                break;
            }
        }

        this.mainContDiv.classList.add(this.recipeCategories.mealTime);
    }

    private updateMealType(): void{
        let oldClass: string = "";

        const category: MealType[] = Object.values(MealType);

        const classList = Array.from(this.edgesDiv[0]!.classList);

        for(let i = 0; i < category.length; i++){
            if(classList.includes(category[i] as string)){
                oldClass = category[i] as string;                    
                break;
            }
        }

        this.edgesDiv.forEach( e => {
            if(oldClass) e.classList.remove(oldClass);
            e.classList.add(this.recipeCategories.mealType);
        });
    }

    private openRecipeDialog(){
        const dialog = document.createElement("dialog", {is: "recipe-dialog"}) as HTMLDialogElement;
        (dialog as any).setAllFields({
            id: this._id,
            name: this._name,
            ingredients: this._ingredients,
            procedures: this._procedures,
            imageLink: this._imageLink,
            accountName: this._accountName,
            mealTime: this.recipeCategories.mealTime,
            mealType: this.recipeCategories.mealType,
            bookmarked: this._bookmarked
            }, this, this.canEdit()
        );
        (dialog as any).myRecipes = this._myRecipes;
        document.body.appendChild(dialog);
        dialog.showModal();
    }

    private canEdit(): boolean{
        return true;
    }

}
customElements.define("recipe-mini", Recipe);