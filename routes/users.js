var express = require("express");
var router = express.Router();
const DButils = require("../modules/DButils");
const search_util = require("./utils/search_recipes");


//Authentication all incoming requsets
router.use(function requireLogin(req, res, next) {
    if (!req.user_id) {
        next({ status: 401, message: "unauthorized" });
    } else {
        next();
    }
});

// gets the watched,saved info for a list of recipes::
router.get("/recipeInfo/:ids", async(req, res) => {
    const ids = JSON.parse(req.params.ids);
    const user_ID = req.user_id;
    const userRecipeData = await getUserInfoOnRecipes(user_ID, ids);
    res.send(userRecipeData);
});

// help function. checks in the DB.
async function getUserInfoOnRecipes(user_id, ids) {
    const userRecipesData = {};
    let is_favorite;
    let is_watched;
    var i;
    for (i = 0; i < ids.length; i++) {
        let currID = ids[i];
        //check if a favorite:
        const result = await DButils.execQuery(
            `SELECT * FROM user_favorites WHERE user_id = '${user_id}' AND recipe_id = '${currID}'`)
        if (result.length == 0) //this recipe is not in favorits.
            is_favorite = false;

        else
            is_favorite = true; // else
        //check if an watched::
        const result2 = await DButils.execQuery(
            `SELECT * FROM user_watched WHERE user_id = '${user_id}' AND recipe_id = '${currID}'`)

        if (result2.length == 0) //this recipe is not in watched.
            is_watched = false;

        else
            is_watched = true; // else

        userRecipesData[currID] = { watched: is_watched, saved: is_favorite };
        //});
    }
    return userRecipesData;
}

// adds current recipe_ID to the saved recipes table. (using the user' cookie)
router.put("/add_to_favorites/recipeId/:recipeId", async(req, res, next) => {
    try {

        const user_ID = req.session.user_id;
        const recipe_ID = req.params.recipeId;

        const recipe =
            await search_util.getRecipesInfo([recipe_ID], false)

        if (!recipe)
            throw { status: 400, message: "recipe not found" }
        const result = await DButils.execQuery(
            `SELECT * FROM user_favorites WHERE user_id = '${user_ID}' AND recipe_id = '${recipe_ID}'`)

        if (result.length == 0) { //this recipe is not in the DB already
            await DButils.execQuery( //adds it
                `INSERT INTO user_favorites VALUES ('${recipe_ID}', '${user_ID}')`
            )
        } else
            throw { status: 408, message: "recipe is already in favorites." }

        res.status(200).send({ message: "saved to your favorites recipes successfully." })
    } catch (error) {
        next(error)
    }
});


// adds current recipe_ID to the watched recipes table. (using the user' cookie)
router.put("/add_to_watched/recipeId/:recipeId", async(req, res, next) => {
    try {
        const user_ID = req.session.user_id;
        const recipe_ID = req.params.recipeId;
        const recipe =
            await search_util.getRecipesInfo([recipe_ID], false)
        if (!recipe)
            throw { status: 400, message: "recipe not found" }
        const result = await DButils.execQuery(
            `SELECT * FROM user_watched WHERE user_id = '${user_ID}' AND recipe_id = '${recipe_ID}'`)
        if (result.length == 0) { //this recipe is not in the DB already
            await DButils.execQuery( //adds it
                `INSERT INTO user_watched VALUES ('${recipe_ID}', '${user_ID}', default)`
            )
        } else // recipe is already exist in watched table.
            await DButils.execQuery( //update its datetime
            `UPDATE user_watched SET insert_time = default WHERE user_id = '${user_ID}' AND recipe_id = '${recipe_ID}'`)
        res.status(200).send({ message: "added to your watched recipes successfully." })
    } catch (error) {
        next(error)
    }
});


// returns all family recipes of the user. (3)
router.get("/my_family_recipes", async(req, res, next) => {
    try {
        const user_ID = req.session.user_id
        const my_recipes =
            await DButils.execQuery(
                `SELECT details FROM MyFamilyRecipes WHERE user_id = '${user_ID}'`)
        if (my_recipes.length == 0)
            throw { status: 405, message: "the user does not have any family recipes to display." }
        let recipesArray = []
        my_recipes_preview =
            my_recipes.map((recipe) => {
                let recipeTestDetails = JSON.parse(recipe.details);
                recipesArray.push(recipeTestDetails);
            })

        res.status(200).send(recipesArray)
    } catch (error) {
        next(error)
    }
});


// returns the user's family recipe with the specific ID.
router.get("/my_family_recipes/recipeId/:recipeId", async(req, res, next) => {
    try {
        const user_ID = req.session.user_id
        const recipe_ID = req.params.recipeId;
        const recipe =
            await DButils.execQuery(
                `SELECT details FROM MyFamilyRecipes WHERE user_id = '${user_ID}' and 
                recipe_id = '${recipe_ID}'`)
        if (recipe.length < 1) {
            throw { status: 400, message: "recipe not found" }
        }
        let recipeTestDetails = JSON.parse(recipe[0].details);
        res.status(200).send(recipeTestDetails)
    } catch (error) {
        next(error)
    }
});


// returns fullview of all personal recipes of the user. (6)
router.get("/fullview/my_recipes", async(req, res, next) => {
    try {
        const user_ID = req.session.user_id
        const my_recipes =
            await DButils.execQuery(
                `SELECT details FROM MyRecipes WHERE user_id = '${user_ID}'`)
        let recipesArray = []
        my_recipes_preview =
            my_recipes.map((recipe) => {
                let recipeTestDetails = JSON.parse(recipe.details);
                var dictionary = {};
                const {
                    recipe_name,
                    ready_in_minutes,
                    likes,
                    vegan,
                    vegetarian,
                    gluten_free,
                    image,
                    instructions,
                    servings,
                    ingredients,
                } = recipeTestDetails[0];
                var content = {
                    recipe_name: recipe_name,
                    ready_in_minutes: ready_in_minutes,
                    likes: likes,
                    vegan: vegan,
                    vegetarian: vegetarian,
                    gluten_free: gluten_free,
                    image: image,
                    instructions: instructions,
                    servings: servings,
                    ingredients: ingredients,
                }
                var recipe_id = recipeTestDetails[0].recipe_id;
                dictionary[recipe_id] = new Object();
                dictionary[recipe_id] = content;
                recipesArray.push(dictionary);
            })
        res.status(200).send(recipesArray)
    } catch (error) {
        next(error)
    }
});

// returns fullview of the specific personal recipes of the user. (6)
router.get("/fullview/my_recipes/recipeId/:recipeId", async(req, res, next) => {
    try {
        const user_ID = req.session.user_id
        const recipe_ID = req.params.recipeId;
        const recipe =
            await DButils.execQuery(
                `SELECT details FROM MyRecipes WHERE user_id = '${user_ID}' and 
                recipe_id = '${recipe_ID}'`)
        if (recipe.length < 1) {
            throw { status: 400, message: "recipe not found" }
        }
        let recipeTestDetails = JSON.parse(recipe[0].details);
        var dictionary = {};
        const {
            recipe_name,
            ready_in_minutes,
            likes,
            vegan,
            vegetarian,
            gluten_free,
            image,
            instructions,
            amount_of_servings,
            ingredients,
        } = recipeTestDetails[0];
        var content = {
            recipe_name: recipe_name,
            ready_in_minutes: ready_in_minutes,
            likes: likes,
            vegan: vegan,
            vegetarian: vegetarian,
            gluten_free: gluten_free,
            image: image,
            instructions: instructions,
            amount_of_servings: amount_of_servings,
            ingredients: ingredients,
        }
        var recipe_id = recipeTestDetails[0].recipe_id;
        dictionary[recipe_id] = new Object();
        dictionary[recipe_id] = content;
        res.status(200).send(dictionary)
    } catch (error) {
        next(error)
    }
});

// returns preview of all personal recipes of the user. (6)
router.get("/preview/my_recipes", async(req, res, next) => {
    try {
        const user_ID = req.session.user_id
        const my_recipes =
            await DButils.execQuery(
                `SELECT details FROM MyRecipes WHERE user_id = '${user_ID}'`)
        let recipesArray = []
        my_recipes_preview =
            my_recipes.map((recipe) => {
                let recipeTestDetails = JSON.parse(recipe.details);
                var dictionary = {};
                const {
                    recipe_name,
                    ready_in_minutes,
                    likes,
                    vegan,
                    vegetarian,
                    gluten_free,
                    image,
                } = recipeTestDetails[0];
                var content = {
                    recipe_name: recipe_name,
                    ready_in_minutes: ready_in_minutes,
                    likes: likes,
                    vegan: vegan,
                    vegetarian: vegetarian,
                    gluten_free: gluten_free,
                    image: image,
                }
                var recipe_id = recipeTestDetails[0].recipe_id;
                dictionary[recipe_id] = new Object();
                dictionary[recipe_id] = content;
                recipesArray.push(dictionary);
            })

        res.status(200).send(recipesArray)
    } catch (error) {
        next(error)
    }
});


// returns fullview of all favorites recipes of the user from the API spooncular!.
router.get("/fullview/my_favorites", async(req, res, next) => {
    try {
        const user_ID = req.session.user_id
        const my_recipes_ids =
            await DButils.execQuery(
                `SELECT recipe_id FROM user_favorites WHERE user_id = '${user_ID}'`)
        if (my_recipes_ids && my_recipes_ids.length > 0) {
            const my_recipes_list = []
            my_recipes_ids.forEach(recipeId => {
                my_recipes_list.push(recipeId.recipe_id);
            });
            search_util.getRecipesInfo(my_recipes_list, false)
                .then((info_array) => res.send(info_array))
                .catch((error) => {
                    res.sendStatus(error.response.status);
                });
        } else {
            throw { status: 404, message: "my_favorites recipes not found" }
        }
    } catch (error) {
        next(error)
    }
});

// returns preview of all favorites recipes of the user from the API spooncular!.
router.get("/preview/my_favorites", async(req, res, next) => {
    try {
        const user_ID = req.session.user_id
        const my_recipes_ids =
            await DButils.execQuery(
                `SELECT recipe_id FROM user_favorites WHERE user_id = '${user_ID}'`)
        if (my_recipes_ids && my_recipes_ids.length > 0) {
            const my_recipes_list = []
            my_recipes_ids.forEach(recipeId => {
                my_recipes_list.push(recipeId.recipe_id);
            });
            search_util.getRecipesInfo(my_recipes_list, true)
                .then((info_array) => res.send(info_array))
                .catch((error) => {
                    res.sendStatus(error.response.status);
                });
        }
    } catch (error) {
        next(error)
    }
});

// returns 3 last watched recipes of the user from the API spooncular!.
router.get("/my_last_watched", async(req, res, next) => {
    try {

        const user_ID = req.session.user_id

        const my_recipes_ids =
            await DButils.execQuery(
                `SELECT TOP 3 recipe_id FROM user_watched WHERE user_id = '${user_ID}' ORDER BY insert_time DESC`)
        if (my_recipes_ids && my_recipes_ids.length > 0) {

            const my_recipes_list = []

            my_recipes_ids.forEach(recipeId => {
                my_recipes_list.push(recipeId.recipe_id);
            });
            search_util.getRecipesInfo(my_recipes_list, true)
                .then((info_array) => res.send(info_array))
                .catch((error) => {
                    res.sendStatus(error.response.status);
                });
        } else
            throw { status: 403, message: "you haven't watched any recipe yet. There is nothing to display." }


    } catch (error) {
        next(error)
    }
});

module.exports = router;