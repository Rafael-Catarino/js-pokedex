const containerPokemon = document.querySelector(".container__pokemon");
const searchPokemon = document.querySelector(".search__pokemon");
const loaderContainer = document.querySelector(".loader__container");
const loaderVertical = document.querySelector(".loader__vertical");

/* Criar o span para o type de cada pokemon  */
const createSpanTypePokemon = (types) => {
  const typesContainer = document.createElement("div");
  typesContainer.classList.add("pokemon__types");

  types.forEach((type) => {
    const spanTypePokemon = document.createElement("span");
    spanTypePokemon.innerText = type;
    spanTypePokemon.classList.add("span__type__pokemon", "type__" + type);

    typesContainer.appendChild(spanTypePokemon);
  });

  return typesContainer;
};

/* Criar o span para o nome de cada pokemon  */
const createSpanNamePokemon = (name) => {
  const spanNamePokemon = document.createElement("span");
  spanNamePokemon.innerText = name;
  spanNamePokemon.className = "span__name__pokemon";
  return spanNamePokemon;
};

/* Criar o img para renderizar a imagem dos pokemons na tela */
const createImgPokemon = (img) => {
  const pokemonImageWrapper = document.createElement("div");
  const imgPokemon = document.createElement("img");
  imgPokemon.src = img;
  imgPokemon.className = "img__pokemon";
  pokemonImageWrapper.className = "pokemon__image__wrapper";
  pokemonImageWrapper.appendChild(imgPokemon);
  return pokemonImageWrapper;
};

/* Criar o span para o id de cada pokemon */
const createSpanIdPokemon = (id) => {
  const spanIdPokemon = document.createElement("span");
  spanIdPokemon.className = "span__id__pokemon";
  spanIdPokemon.innerText = "#" + id;
  return spanIdPokemon;
};

/* Criar a div pokemon */
const createDivPokemon = (typecolor) => {
  const divPokemon = document.createElement("div");
  divPokemon.classList.add("cart__pokemon", typecolor);
  return divPokemon;
};

function formatPokemonName(name) {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/* função que monta as divs de cada pokemon */
const ridingDivPokemon = ({ id, img, name, type, typecolor }) => {
  const divPokemon = createDivPokemon(typecolor);
  divPokemon.appendChild(createSpanIdPokemon(id));
  divPokemon.appendChild(createImgPokemon(img));
  divPokemon.appendChild(createSpanNamePokemon(formatPokemonName(name)));
  divPokemon.appendChild(createSpanTypePokemon(type));
  containerPokemon.appendChild(divPokemon);
};

const getPokemonImage = (sprites) => {
  return (
    sprites.other?.dream_world?.front_default ||
    sprites.other?.["official-artwork"]?.front_default ||
    sprites.front_default
  );
};

/* Função que monta o objeto de cada pokemon */
const createObjPokemon = (data) => {
  const pokemon = {
    id: data.id,
    img: getPokemonImage(data.sprites),
    name: data.name,
    type: data.types.map((types) => types.type.name),
    typecolor: data.types[0].type.name,
  };
  ridingDivPokemon(pokemon);
};

let filteredList = [];
let currentIndex = 0;
const itemsPerPage = 15;
let arrPokemons = [];
let isLoading = false;
const getPokemons = async () => {
  try {
    const url = `https://pokeapi.co/api/v2/pokemon?limit=1500&offset=0`;
    const response = await fetch(url);
    const data = await response.json();
    arrPokemons = data.results;
    filteredList = arrPokemons;
  } catch (error) {
    console.error("Erro ao buscar lista inicial:", error);
  }
};

const fetchPokemons = async () => {
  if (isLoading) return;
  isLoading = true;
  try {
    const nextBatch = filteredList.slice(
      currentIndex,
      currentIndex + itemsPerPage,
    );
    const arrPromises = nextBatch.map((pokemon) =>
      fetch(pokemon.url).then((res) => res.json()),
    );
    const pokemons = await Promise.all(arrPromises);
    pokemons.forEach((pokemon) => createObjPokemon(pokemon));
    currentIndex += itemsPerPage;
  } catch (error) {
    console.error("Erro ao carregar detalhes:", error);
  } finally {
    isLoading = false;
    loaderContainer.style.display = "none";
    loaderVertical.style.display = "none";
  }
};

searchPokemon.addEventListener("input", async () => {
  containerPokemon.innerHTML = "";
  currentIndex = 0;
  const searchPokemonValue = searchPokemon.value.toLowerCase();
  filteredList = arrPokemons.filter((pokemon) => {
    return pokemon.name.includes(searchPokemonValue);
  });
  if (filteredList.length === 0) {
    containerPokemon.innerHTML = `<p class="no-results">Nenhum Pokémon encontrado para "${searchPokemonValue}"</p>`;
    loaderVertical.style.display = "none";
  } else {
    await fetchPokemons();
  }
});

window.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 100 && !isLoading) {
    if (currentIndex < filteredList.length) {
      loaderVertical.style.display = "flex";
      fetchPokemons();
    }
  }
});

window.onload = async () => {
  loaderContainer.style.display = "flex";
  await getPokemons();
  await fetchPokemons();
};
