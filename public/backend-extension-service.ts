import { RecipeFields } from "./components/recipe/recipe-mini/recipe";

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

    async accountGetRecipe(id: number): Promise<RecipeFields>{
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

    async accountDeleteRecipe(id: number): Promise<boolean>{
        const res = await fetch(`api/recipes/${id}`, { method: "DELETE" });

        if(!res.ok) throw new Error(`Error Deleting Recipe: ${res.status}`);

        return true;
    }
}