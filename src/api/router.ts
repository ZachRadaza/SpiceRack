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
    { id: "00000001", name: "Spaghetti", ingredients: [], procedures: [], imageLink: "", accountName: "", /*mealTime: MealTime.lunch, mealType: MealType.pasta*/ },
    { id: "00000002", name: "Garlic Noodles", ingredients: [], procedures: [], imageLink: "", accountName: "", /*mealTime: MealTime.lunch, mealType: MealType.pasta*/ },
    { id: "00000003", name: "Pasta de Luce", ingredients: [], procedures: [], imageLink: "", accountName: "", /*mealTime: MealTime.lunch, mealType: MealType.pasta*/ },
];

//return all recipes
router.get("/recipes", (req, res) => {
    try{
        const search: string = req.query.q as string | "";
        const page: number = parseInt(req.query.page as string) | 1;
        const pageSize: number = parseInt(req.query.pageSize as string) | 10;
        let filtered: any = [];

        if(search){
            recipes.forEach(r => {
                if(r.name.toLowerCase() === search?.toLowerCase()){
                    filtered.push(r);
                }
            });
        } else {
            filtered = recipes;
        }

        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const pagedResults = filtered.slice(start, end);
        const totalPages = Math.ceil((filtered.length / pageSize));

        res.status(200);
        res.json({
            data: pagedResults,
            meta: {
                query: { q: search, page: page, pageSize: pageSize },
                total: filtered.length,
                page: page,
                pageSize: pageSize,
                totalPages: totalPages,
                hasPrev: page > 1,
                hasNext: page < totalPages
            },
            links:{
                self: `/api/recipes?q=${search}&page=${page}&pageSize=${pageSize}`,
                ...(((search && filtered.length > 0) || (!search)) && {
                    first: `/api/recipes?q=${search}&page=1&pageSize=${pageSize}`
                }),
                ...(page > 1 && {
                    prev: `/api/recipes?q=${search}&page=${page - 1}&pageSize=${pageSize}`
                }),
                ...(page < totalPages && {
                    next: `/api/recipes?q=${search}&page=${page + 1}&pageSize=${pageSize}`
                }),
                ...(((search && filtered.length > 0) || (!search)) && {
                    last: `/api/recipes?q=${search}&page=${totalPages}&pageSize=${pageSize}`
                })
            }
        });
    } catch(error: unknown){
        res.status(404);
        res.json({
            error: error,
            message: "Invalid Request"
        });
    }
});

//create recipe
router.post("/recipes", (req, res) => {
    try{
        if(req.body.name === "" || req.body.name === null){
            res.status(400);
            res.json(error);
            return;   
        }

        const uniqId: string = createUniqueId();

        const recipeNew = {
            id: uniqId, 
            name: req.body.name, 
            ingredients: req.body.ingredients, 
            procedures: req.body.procedures,
            imageLink: req.body.imageLink,
            accountName: req.body.accountName,
            mealTime: req.body.mealTime,
            mealType: req.body.mealType
        }
        recipes.push(recipeNew);

        res.status(201);
        res.json(recipeNew);
    } catch(error: unknown){
        res.status(400);
        res.json(error);
    }

    function createUniqueId(): string{
        let idNum: number = 0;
        let id: string = "";

        function checkUniqueId(num: number):boolean {
            for(let i = 0; i < recipes.length; i++){
                const currentId = Number(recipes[i]!.id);
                if(currentId === num){
                    return false;
                }
            }
            return true;
        }

        do{
            idNum = Math.random() * 100000000;
            idNum = Math.floor(idNum);
        } while(!checkUniqueId(idNum));

        id = idNum.toString();

        while(id.length < 6){
            id = "0" + id;
        }

        return id;
    }
});

//gets id and returs recipe
router.get("/recipes/:id", (req, res) => {
    try{
        let recipeRet: number = searchId(req.params.id);

        if(recipeRet <= -1){
            res.status(404);
            res.json({ error: "recipe id does not exist"});
        } else {
            res.status(200);
            res.json(recipes[recipeRet]);
        }
    } catch(error: unknown){
        res.status(400);
        res.json(error);
    }
});

//replace recipe by id
router.put("/recipes/:id", (req, res) => {
    try{
        const index = searchId(req.params.id);

        if(index <= -1){
            res.status(404);
            res.json({ error:"recipe id does not exist"});
            return;
        }

        const recipeNew = {
            id: req.params.id,
            name: req.body.name, 
            ingredients: req.body.ingredients, 
            procedures: req.body.procedures,
            imageLink: req.body.imageLink,
            accountName: req.body.accountName,
            mealTime: req.body.mealTime,
            mealType: req.body.mealType
        }

        recipes[index] = recipeNew;

        res.status(200)
        res.json({ message:`recipe id: ${req.params.id} was updated` });
    } catch(error: unknown){
        res.status(400);
        res.json(error);
    }
});

//delete recipe by id
router.delete("/recipes/:id", (req, res) => {
    try{
        const index: number = searchId(req.params.id);

        if(index <= -1){
            res.status(404);
            res.json({ error:"recipe id does not exist"});
            return;
        }

        recipes.splice(index, 1);

        res.status(200);
        res.json({ message:`recipe id: ${req.params.id} was deleted` });

    } catch(error: unknown){
        res.status(400);
        res.json(error);
    }
});

//TODO: have a better searching algorithm
function searchId(id: string): number{
    let ret: number = -1;
    for(let i = 0; i < recipes.length; i++){
        if(recipes[i]!.id === id){
            ret = i;
            break;
        }
    }

    return ret;
}

export default router;