import { RecipeFields } from "./components/recipe/recipe-mini/recipe.js";

export class BackendExtensionService{

    async accountGetAllRecipes(): Promise<[RecipeFields[], number]>{
        const res = await fetch("/api/recipes");
        if(!res.ok) throw new Error(`Error: ${res.status}`);

        const data = await res.json();
        return data.data;
    }

    async accountCreateRecipe(recipe: Omit<RecipeFields, "id" | "mini">): Promise<RecipeFields>{
        const res = await fetch("api/recipes", {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(recipe)
        });

        if(!res.ok) throw new Error(`Error Creating Recipe: ${res.status}`);
        const data = await res.json();
        return data.data as RecipeFields;
    }

    async accountGetRecipe(id: string): Promise<RecipeFields>{
        const res = await fetch(`/api/recipes/${id}`);

        if(!res.ok) throw new Error(`Error Retrieving Recipe: ${res.status}`);

        const data = await res.json();
        return data.data as RecipeFields;
    }

    async accountUpdateRecipe(recipe: Omit<RecipeFields, "mini">): Promise<RecipeFields>{
        const res = await fetch(`api/recipes/${recipe.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(recipe)
        });

        if(!res.ok) throw new Error(`Error Updating Recipe: ${res}`);

        return res.json() as Promise<RecipeFields>;
    }

    async accountDeleteRecipe(id: string): Promise<boolean>{
        const res = await fetch(`api/recipes/${id}`, { method: "DELETE" });

        if(!res.ok) throw new Error(`Error Deleting Recipe: ${res.status}`);

        return true;
    }

    async getAllRecipes(q: string = "", skip?: number, take?: number) {
        const res = await fetch(`/api/recipes?q=${q.toLowerCase()}&skip=${skip || 0}&take=${take || 15}`);
        if(!res.ok) throw new Error(`Error: ${res.status}`);

        const data = await res.json();
        return data.data;
    }

    //auth
    async loginUser(loginCred: { email: string, password: string }){
        const res = await fetch(`/api/auth/login`, { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginCred)
        });

        let data;
        if(res.ok)
            data = await res.json();
        else
            data = false;

        return data;
    }

    async signUpUser(signUpCred: { email: string, username: string, password: string }){
        const res = await fetch(`/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(signUpCred)
        })

        if(!res.ok) throw new Error(`Error in Signing in: ${res.status}`);
        const data = await res.json();
        return data;
    }

    async checkUsername(username: string){
        const res = await fetch(`/api/auth/${username}`);

        if(!res.ok) throw new Error(`Error Checking Usernames: ${res.status}`);

        const data = await res.json();
        return data;
    }

    async checkEmail(email: string){
        const res = await fetch(`/api/auth/${email}`);

        if(!res.ok) throw new Error(`Error Checking Emails: ${res.status}`);

        const data = await res.json();
        return data;
    }

    async getUser(id: string){
        const res = await fetch(`/api/auth/${id}`);

        if(!res.ok) throw new Error(`Error Fetching User: ${res.status}`);

        const data = await res.json();
        return data;
    }
}