import Search from './models/Search';
import {elements, renderLoader, clearLoader} from './views/base';
import * as searchView from './views/searchView';
import Recipe from './models/Recipe';
import * as recipeView from './views/recipeView';
import List from './models/List';
import * as listView from './views/listView';
import Likes from './models/Likes';
import * as likesView from './views/likesView';
/*Global state of the app 
* - Search Object
* - Current recipe Object
* - Shopping list Object
* - Liked Recipes
*/
const state = {};


/* Search Controller */
const controlSearch = async () => {
	// 1) Get the query from the view.
	const query = searchView.getInput();

	if(query){
		// 2) New Search Object and add it to state.
		state.search = new Search(query);

		// 3) Prepare UI for results
		searchView.clearInput();
		searchView.clearResults();
		renderLoader(elements.searchResult);
		try{
			// 4) Search for recipes
			await state.search.getResults();
			clearLoader();
			// 5) Render results on UI
	
			searchView.renderResults(state.search.result);	
		}
		catch (err){
			alert('Something Went Wrong');
			clearLoader();
		}
	}
}

elements.searchForm.addEventListener('submit' , e => {
	e.preventDefault(); /*No API call when search field is empty.*/
	controlSearch();
});

elements.searchResultsPages.addEventListener('click' , e => {
	const btn = e.target.closest('.btn-inline');
	if(btn){
		const goToPage = parseInt(btn.dataset.goto, 10);
		searchView.clearResults(); 
		searchView.renderResults(state.search.result, goToPage);
	}
});



/* Recipe Controller */

const controlRecipe = async () => {
	// Get Id from url.
	const id = window.location.hash.replace('#','');
	if(id) {
		// Prepare UI for changes
		recipeView.clearRecipe();
		renderLoader(elements.recipe);

		// Highlight select search item.
		if (state.search) searchView.highlightSelected(id);

		// Create a new Recipe Object
		state.recipe = new Recipe(id);
		try{
				// Get Recipe data and parse ingredients.
			await state.recipe.getRecipe();
			state.recipe.parseIngredients();
			// Calculate servings and time.
			state.recipe.calcServings();
			state.recipe.calcTime();	
			// Render the recipe.
			clearLoader();
			recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
		}
		catch(err) {
			console.log(err);
			alert('Error Processing Recipe');
		}
	}
	
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

window.l = new List();
// List Controller

const controlList = () => {

	// Create a new List if none.
	if(!state.list) state.list = new List();

	// Add each ingredient to the list.
	state.recipe.ingredients.forEach(el => {
		const item = state.list.addItem(el.count, el.unit, el.ingredient)
		listView.renderItem(item);
	});

}


// Handling delete and update list item events
elements.shopping.addEventListener('click', e => {
	const id = e.target.closest('.shopping__item').dataset.itemid;

	// Handle delete event 
	if(e.target.matches('.shopping__delete, .shopping__delete *')){
		// Delete from state and UI
		state.list.deleteItem(id);
		listView.deleteItem(id);

	// Handle Count Update.
	} else if (e.target.matches('.shopping__count-value')) {
		const val = parseFloat(e.target.value);
		state.list.updateCount(id, val);
	}
});


// Like Controller
const controlLike = () => {
	if(!state.likes) state.likes = new Likes();
	const currentId = state.recipe.id;
	
	// User has not liked current recipe.

	if(!state.likes.isLiked(currentId)){

		// Add like to the state.
		const newLike = state.likes.addLike(currentId, state.recipe.title, state.recipe.author, state.recipe.image);

		// Toggle the like button.
		likesView.toggleLikeButton(true);

		// Add like to UI list
		likesView.renderLike(newLike)


		// User has liked the current recipe.
	} else {

		// Remove like from the state.
		state.likes.deleteLike(currentId);

		// Toggle the like button.
		likesView.toggleLikeButton(false);		

		// Remove like to UI list
		likesView.deleteLike(currentId);
	}
	
	likesView.toggleLikeMenu(state.likes.getNumberOfLikes());	
};


// Restore liked recipes on page load.
window.addEventListener('load', () => {
	// Create Like Object
	state.likes = new Likes();
	// Get existing like from localStorage.
	state.likes.retrieveLikes();
	// Toggle likes menu button.
	likesView.toggleLikeMenu(state.likes.getNumberOfLikes());
	// Render the existing likes.
	state.likes.likes.forEach(like => likesView.renderLike(like));
});

// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
	if(e.target.matches('.btn-decrease, .btn-decrease *')) {
		// Decrease is clicked.
		if(state.recipe.servings > 1) {
			state.recipe.updateServings('dec');
			recipeView.updateServingsIngredients(state.recipe);
		}
	} else if (e.target.matches('.btn-increase, .btn-increase *')) {
		// Increase is clicked.
		state.recipe.updateServings('inc');
		recipeView.updateServingsIngredients(state.recipe);
	} else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
		controlList();
	} else if (e.target.matches('.recipe__love, .recipe__love *')) {
		// Like Controller
		controlLike();
	}
		
});
