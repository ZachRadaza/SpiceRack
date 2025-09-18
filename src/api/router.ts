import { error } from "console";
import { Router } from "express";

const router = Router();

router.get("/health", (req, res) => {
    res.json({
        ok: true,
        time: new Date().toISOString(),
    });
});

const recipes = [
    { id: 1, name: "Spaghetti", ingredients: [], procedures: [], imageLink: "", accountName: "", /*mealTime: MealTime.lunch, mealType: MealType.pasta*/ },
    { id: 2, name: "Garlic Noodles", ingredients: [], procedures: [], imageLink: "", accountName: "", /*mealTime: MealTime.lunch, mealType: MealType.pasta*/ },
    { id: 3, name: "Pasta de Luce", ingredients: [], procedures: [], imageLink: "", accountName: "", /*mealTime: MealTime.lunch, mealType: MealType.pasta*/ },
];

//return all recipes
router.get("/recipes", (req, res) => {
    res.json(recipes);
});

router.post("/recipes", (req, res) => {
    try{
        if(req.body.name === "" || req.body.name === null){
            res.status(400);
            res.json(error);
            return;   
        }

        let idRec = 0;
        do{
            idRec = Math.random() * 100000;
        } while(!checkUniqueId(idRec));

        const recipe = {
            id: idRec, 
            name: req.body.name, 
            ingredients: req.body.ingredients, 
            procedures: req.body.procedures,
            imageLink: req.body.imageLink,
            accountName: req.body.accountName,
            mealTime: req.body.mealTime,
            mealType: req.body.mealType
        }
        recipes.push(recipe);

        res.status(201);
        res.json(recipe);
    } catch(error: unknown){
        res.status(400);
        res.json(error);
    }
});

//gets id and returs recipe
router.get("/recipes/:id", (req, res) => {
    let recipeRet: number = -1;
    recipes.forEach( r => {
        const idNumber: number = +req.params.id;
        if(r.id === idNumber){
            recipeRet = r.id;
        }
    })

    if(recipeRet <= -1){
        res.status(404);
        res.json({ error: "recipe id does not exist"});
    } else {
        res.status(200);
        res.json(recipes[recipeRet - 1]);
    }
});

router.put("/recipes/:id", (req, res) => {
    
});

function checkUniqueId(num: number):boolean {
    for(let i = 0; i < recipes.length; i++){
        if(recipes[i]!.id === num){
            return false;
        }
    }

    return true;
}

export default router;