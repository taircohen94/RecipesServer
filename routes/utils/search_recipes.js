const axios = require("axios");

const recipes_api = "https://api.spoonacular.com/recipes";
const api_key = `apiKey=${process.env.spooncular_apiKey}`;
var isRandom = false;

// this functions returns a recipe info 
async function getRecipesInfo(recipes_id_list, preview) {
    let promises = [];
    // foreach id 
    recipes_id_list.map((id) =>
        promises.push(axios.get(`${recipes_api}/${id}/information?${api_key}`))
    );
    // return all the results of the promises 
    let info_response = await Promise.all(promises);
    if (preview) {
        return extractRelvantRecipesDataPreview(info_response);
    }
    return extractRelvantRecipesDataFullview(info_response);
}

// this function extract the recipe data for full view 
function extractRelvantRecipesDataFullview(recipes_info) {

    var counter = 0;
    recipes_info.map((recipe_info) => {
        const {
            title,
            readyInMinutes,
            aggregateLikes,
            vegan,
            vegetarian,
            glutenFree,
            image,
            instructions,
            servings,
        } = recipe_info.data;

        var content = {
            title: title,
            readyInMinutes: readyInMinutes,
            aggregateLikes: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
            image: image,
            instructions: instructions,
            servings: servings,
        };

        var ingredients = recipe_info.data.extendedIngredients;
        var allIngredients = [];
        for (let index = 0; index < ingredients.length; index++) {
            const {
                name,
                amount,
                unit,
            } = ingredients[index];
            var ingredientsContent = {
                name: name,
                amount: amount,
                unit: unit,
            }
            allIngredients.push(ingredientsContent);
        }
        content["ingredients"] = allIngredients;
        recipes_info[counter] = content;
        counter++;
        // recipes_info.push(allIngredients);
    });

    return recipes_info;

    // var dictionary = {};
    // return recipes_info.map((recipe_info) => {
    //     const {
    //         title,
    //         readyInMinutes,
    //         aggregateLikes,
    //         vegan,
    //         vegetarian,
    //         glutenFree,
    //         image,
    //         instructions,
    //         servings,
    //         ingredients,
    //     } = recipe_info.data;

    //     var content = {
    //         title: title,
    //         readyInMinutes: readyInMinutes,
    //         aggregateLikes: aggregateLikes,
    //         vegan: vegan,
    //         vegetarian: vegetarian,
    //         glutenFree: glutenFree,
    //         image: image,
    //         instructions: instructions,
    //         servings: servings,
    //         ingredients: ingredients
    //     };

    // var ingredients = recipe_info.data.extendedIngredients;
    // var allIngredients = [];
    // for (let index = 0; index < ingredients.length; index++) {
    //     const {
    //         name,
    //         amount,
    //         unit,
    //     } = ingredients[index];
    //     var ingredientsContent = {
    //         name: name,
    //         amount: amount,
    //         unit: unit,
    //     }
    //     allIngredients.push(ingredientsContent);
    // }
    // content["ingredients"] = allIngredients;
    // var recipe_id = recipe_info.data.id;
    // dictionary[recipe_id] = new Object();
    // dictionary[recipe_id] = content;
    // });
    // return dictionary;
}

// this function extract the instructions for recipe from the spooncular api 
function extractInstructions(recipes_info) {
    recipes_info.map((recipe_info) => {
        var instructions = recipe_info.data.instructions;
        if (instructions === "") {
            return false;
        }
    });
    return true;
}

// this function extract the recipe data for preview 
function extractRelvantRecipesDataPreview(recipes_info) {
    return recipes_info.map((recipe_info) => {
        const {
            id,
            title,
            readyInMinutes,
            aggregateLikes,
            vegan,
            vegetarian,
            glutenFree,
            image,
        } = recipe_info.data;

        return {
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            aggregateLikes: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
            image: image,
        };


    });

    // var dictionary = {};
    // return recipes_info.map((recipe_info) => {
    //     const {
    //         title,
    //         readyInMinutes,
    //         aggregateLikes,
    //         vegan,
    //         vegetarian,
    //         glutenFree,
    //         image,
    //     } = recipe_info.data;

    //     var content = {
    //         title: title,
    //         readyInMinutes: readyInMinutes,
    //         aggregateLikes: aggregateLikes,
    //         vegan: vegan,
    //         vegetarian: vegetarian,
    //         glutenFree: glutenFree,
    //         image: image,
    //     };
    //     // var recipe_id = recipe_info.data.id;
    //     // dictionary[recipe_id] = new Object();
    //     // dictionary[recipe_id] = content;
    // });
    // return dictionary;
}

// this is the main function for search recipes - returns preivew of the recipes as
// dictioary 
async function searchForRecipes(search_params) {
    let search_response = await axios.get(
        `${recipes_api}/search?${api_key}`, {
            params: search_params,
        }
    );
    const recipes_id_list = extractSearchResultIds(search_response);
    let info_array = await getRecipesInfo(recipes_id_list, true);
    return info_array;
}

// this function returns the ids of the recipes that required by the search request 
function extractSearchResultIds(search_response) {
    let recipes;
    if (isRandom) {
        recipes = search_response.data.recipes;
    } else {
        recipes = search_response.data.results;
    }
    recipes_id_list = [];
    recipes.map((recipe) => {
        recipes_id_list.push(recipe.id)
    });
    return recipes_id_list;
}

// this function extract the queirs params for search request 
function extractQueriesParams(query_params, search_params) {
    const params_list = ["diet", "cuisine", "intolerances"];
    params_list.forEach((param) => {
        if (query_params[param]) {
            search_params[param] = query_params[param];
        }
    });
}

// this function return 3 random recipes - preview 
async function getRandomRecipes(random_params) {
    // const recipes_id_list = await findRecipesWithInstructions(random_params);
    // let info_array = await getRecipesInfo(recipes_id_list, true);
    // isRandom = false;
    const info_array = await findRecipesWithInstructions(random_params);
    // let info_array = await getRecipesInfo(recipes_id_list, true);
    return info_array;
}

// this function finds 3 recipes with instructions 
async function findRecipesWithInstructions(random_params) {
    let random_recipe = await axios.get(`${recipes_api}/random?${api_key}`, {
        params: random_params,
    });
    random_recipe.data.recipes.forEach(random => {
        if (random.instructions === "") {
            findRecipesWithInstructions(random_params);
        }
    });
    // const recipes_id_list = extractSearchResultIds(random_recipe);
    // let promises = [];
    // recipes_id_list.map((id) =>
    //     promises.push(axios.get(`${recipes_api}/${id}/information?${api_key}`))
    // );
    // let info_response = await Promise.all(promises);
    // let allRecipesHasInstructions = extractInstructions(info_response);
    // if (!allRecipesHasInstructions) {
    //     findRecipesWithInstructions(random_params);
    //     console.log("didnt find recipes with insturctions");
    // }
    return random_recipe.data.recipes.map((recipe_info) => {
        const {
            id,
            title,
            readyInMinutes,
            aggregateLikes,
            vegan,
            vegetarian,
            glutenFree,
            image,
        } = recipe_info;

        return {
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            aggregateLikes: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
            image: image,
        };
    });
}
// this function returns a preview for recipe by his id 
async function getPreivewForRecipe(search_params) {
    let id = search_params.recipeId;
    recipes_id_list = [];
    recipes_id_list.push(id)
    let promises = [];
    recipes_id_list.map((id) =>
        promises.push(axios.get(`${recipes_api}/${id}/information?${api_key}`))
    );
    let info_response = await Promise.all(promises);
    return extractRelvantRecipesDataPreview(info_response);
}

// this function returns a fullview for recipe by his id 
async function getFullviewForRecipe(search_params) {
    let id = search_params.recipeId;
    recipes_id_list = [];
    recipes_id_list.push(id)
    let promises = [];
    recipes_id_list.map((id) =>
        promises.push(axios.get(`${recipes_api}/${id}/information?${api_key}`))
    );
    let info_response = await Promise.all(promises);
    var theResult = extractRelvantRecipesDataFullview(info_response);
    return theResult;
}

exports.extractQueriesParams = extractQueriesParams;
exports.searchForRecipes = searchForRecipes;
exports.getRecipesInfo = getRecipesInfo;
exports.getRandomRecipes = getRandomRecipes;
exports.getPreivewForRecipe = getPreivewForRecipe;
exports.getFullviewForRecipe = getFullviewForRecipe;
exports.extractRelvantRecipesDataPreview = extractRelvantRecipesDataPreview;