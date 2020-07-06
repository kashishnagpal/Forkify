import axios from 'axios';

export default class Recipe {
	constructor(id){
		this.id = id;
	}

	async getRecipe(){
		try{
			const result = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
			this.title = result.data.recipe.title;
			this.author = result.data.recipe.publisher;
			this.image = result.data.recipe.image_url;
			this.url = result.data.recipe.source_url;
			this.ingredients = result.data.recipe.ingredients;
		}
		catch(error)
		{
			console.log(error);
			alert('Something went wrong :(');
		}
	}

	calcTime() {
		// Assuming 15 minutes time for every 3 ingredients
		const noOfIngredients = this.ingredients.length;
		const periods = Math.ceil(noOfIngredients / 3);
		this.time = periods * 15;
	}

	calcServings() {
		this.servings = 4;
	}	

	parseIngredients() { 
		const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
		const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
		const units = [...unitsShort, 'kg', 'g'];
		const newIngredients = this.ingredients.map(el => {
			// 1) Uniform Units

			let ingredient = el.toLowerCase();
			unitsLong.forEach((unit, i) => {
				ingredient = ingredient.replace(unit, units[i]);
			});
			// 2) Remove Parenthesis

			ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

			// 3) Parse ingredients into count, unit and ingredient
			const arrIng = ingredient.split(' ');
			const unitIndex = arrIng.findIndex(el2 => units.includes(el2));
			let objIngredient;

			if(unitIndex > -1){
				// There is a unit
				// Example 4 1/2 cups our count will be 4 1/2
				// Example 4 cups our count will be 4
				
				const arrCount = arrIng.slice(0,unitIndex);
				let count;
				if(arrCount.length === 1) {
					count = eval(arrIng[0].replace('-', '+'));

				} else {
					count = eval(arrIng.slice(0,unitIndex).join('+'));
				}

				objIngredient = {
					count,
					unit: arrIng[unitIndex],
					ingredient: arrIng.slice(unitIndex + 1).join(' ')
				};

			} else if  (parseInt(arrIng[0],10)){
				// There is no UNIT, but 1st element is number.
				objIngredient = {
					count : parseInt(arrIng[0],10),
					unit: '',
					ingredient: arrIng.slice(1).join(' '),
				};

			} else if (unitIndex === -1) {
				// There is no unit and no number.
				objIngredient = {
					count : 1,
					unit: '',
					ingredient,
				};
			}

			return objIngredient;
		});

		this.ingredients = newIngredients;
	}

	updateServings(type) {
		// Servings
		const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

		// Ingredients
		this.ingredients.forEach(el => {
			el.count *= (newServings / this.servings);
		});

		this.servings = newServings;
	}
}