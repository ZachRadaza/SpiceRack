export interface Recipe{
    id: string;
    name: string;
    ingredients: string[];
    procedures: string[];
    imageLink: string;
    accountName: string;
    mealTime: MealTime;
    mealType: MealType;
    bookmarked: boolean;
}

export enum MealTime {
    breakfast = "breakfast",
    lunch = "lunch",
    dinner = "dinner"
}

export enum MealType{
    pasta = "pasta",
    salad = "salad",
    protien = "protien",
    side = "side",
    snack = "snack",
    food = "food"
}