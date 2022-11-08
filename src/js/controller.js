import * as model from './model.js';

import { MODAL_CLOSE_SEC } from './config.js';

import RecipeView from './views/recipeView.js';
import SearchView from './views/searchView.js';
import ResultsView from './views/resultsView.js';
import PaginationView from './views/paginationView.js';
import BookmarksView from './views/bookmarksView.js';
import AddRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    RecipeView.renderSpinner();

    // 0) UPDATE RESULTS VIEW TO HIGHLIGHT SELECTED SEARCH RESULT
    ResultsView.update(model.getSearchResultsPage());

    // 1) Updating bookmarksView
    BookmarksView.update(model.state.bookmarks);

    // 2) Loading the recipe
    await model.loadRecipe(id);

    // 3) Rendering the recipe
    RecipeView.render(model.state.recipe);
  } catch (error) {
    RecipeView.renderError();
    console.error(error);
  }
};

const controlSearchResults = async function () {
  try {
    ResultsView.renderSpinner();

    // 1) Get search query
    const query = SearchView.getQuery();
    if (!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render resultsView
    ResultsView.render(model.getSearchResultsPage());

    // 4) Render initial pagination buttons
    PaginationView.render(model.state.search);
  } catch (error) {
    console.log(error);
  }
};

const controlPagination = function (goToPage) {
  // 1) Render NEW results
  ResultsView.render(model.getSearchResultsPage(goToPage));

  // 2) Render pagination buttons
  PaginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Updates the recipe servings (in state)
  model.updateServings(newServings);

  // Updates the recipeView
  // recipeView.render(model.state.recipe);
  RecipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) Update recipeView
  RecipeView.update(model.state.recipe);

  // 3) Render bookmarksView
  BookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  BookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Render loading spinner before uploading new recipe
    AddRecipeView.renderSpinner();

    // Upload newRecipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render uploaded recipe
    RecipeView.render(model.state.recipe);

    // Render upload recipe success message
    AddRecipeView.renderMessage();

    // Render bookmarksView
    BookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    // window.history.back();

    // Close upload recipe form
    setTimeout(function () {
      AddRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (error) {
    console.error('ERROR ⛔️', error);
    AddRecipeView.renderError(error.message);
  }
};

const init = function () {
  BookmarksView.addHandlerRender(controlBookmarks);
  RecipeView.addHandlerRender(controlRecipes);
  RecipeView.addHandlerUpdateServings(controlServings);
  RecipeView.addHandlerAddBookmark(controlAddBookmark);
  SearchView.addHandlerSearch(controlSearchResults);
  PaginationView.addHandlerClick(controlPagination);
  AddRecipeView.addHandlerUpload(controlAddRecipe);
  console.log('Welcome!');
};
init();
