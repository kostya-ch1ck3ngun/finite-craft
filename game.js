let elements = new Map();
let recipes = new Map();
let playerElements = new Set();

let element1 = null;
let element2 = null;

load();
update();

function save () {
    localStorage.setItem('playerElements', JSON.stringify(Array.from(playerElements)));
}
    
function load () {
    const data = localStorage.getItem('playerElements');
    if (data) {
        let dataParsed = JSON.parse(data);
        if (dataParsed) {
            if (dataParsed.length > 0) {
                playerElements = new Set(dataParsed);
            }
        }
    }
}

function update () {
    parseElementsFile("elements.txt").then(() => {createElementList()});
    parseRecipeFile("recipes.txt");
}

function clearData () {
    localStorage.setItem('playerElements', null);
    playerElements.clear();
    
    update();
}
    
function setPlayerElement (element) {
    let icon = document.createElement('h1');
    let text = document.createElement('p');
    
    let words = elements.get(element).split(" ");

    let ico = words[0];
    let word = "";
    for (let j = 1; j < words.length; j++) {
        word += words[j] + " ";
    }
    icon.textContent = ico;
    text.textContent = word;

    if (element1 == null) {
        let elementContainer = document.getElementById("element1Container");
        element1 = element;
        elementContainer.appendChild(icon);
        elementContainer.appendChild(text);
        elementContainer.addEventListener('click', () => {
            removeContainerElements(elementContainer);
            element1 = null;
        })
    } else if (element2 == null) {
        let elementContainer = document.getElementById("element2Container");
        element2 = element;
        elementContainer.appendChild(icon);
        elementContainer.appendChild(text);
        elementContainer.addEventListener('click', () => {
            removeContainerElements(elementContainer);
            element2 = null;
        })
    }
}
    
function removeContainerElements(container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}
    
function createElementList () {
    let elementsContainer = document.getElementById('elementsContainer');
        
    if (elementsContainer) {
        removeContainerElements(elementsContainer);
    }
        
    let elementsCount = document.createElement('h1');
    elementsCount.classList.add('elementsCounter');
    elementsCount.textContent = "Открыто элементов " + playerElements.size + "/" + elements.size;
    elementsContainer.appendChild(elementsCount);
        
    playerElements.forEach(element => {
        createElement(element);
    });
}
    
function createElement (element) {
    let newElement = document.createElement('p');
    newElement.textContent = elements.get(element);
    newElement.classList.add('playerElement')
    newElement.addEventListener('click', () => {
        setPlayerElement(element);
    })
    document.getElementById('elementsContainer').appendChild(newElement);
}
    
function animate () {
    let container = document.getElementById("rowContainer");
    container.classList.add("animate");
    setTimeout(() => {
        container.classList.remove("animate");
    }, 500);
}
    
function combineElements() {    
    if (!playerElements.has(element1) || !playerElements.has(element2)) {
        animate();
        return null;
    }
        
    let combinedElement = tryToFindRecipes(element1, element2);
        
    if (!combinedElement) {
        animate();
        element1 = null;
        element2 = null;
        removeContainerElements(document.getElementById("element1Container"));
        removeContainerElements(document.getElementById("element2Container"));
        return null;
    }
        
    if (!playerElements.has(combinedElement)) {
        playerElements.add(combinedElement);
        
        let menuContent = document.getElementById('menuContent');

        openMenu();
        document.getElementById('menuButton').textContent = "Закрыть";
        
        let words = elements.get(combinedElement).split(" ");

        let ico = words[0];
        let word = "";
        for (let j = 1; j < words.length; j++) {
            word += words[j] + " ";
        }

        let text = document.createElement('h3');
        text.textContent = word;

        menuContent.appendChild(text);
        
        let icon = document.createElement('h1');
        icon.classList.add('icon');
        icon.textContent = ico;

        menuContent.appendChild(icon);
        
        let head = document.createElement('h2');
        head.textContent = "Новый элемент!";

        menuContent.appendChild(head);
    }
    
    save();
        
    createElementList();

    removeContainerElements(document.getElementById("element1Container"));
    removeContainerElements(document.getElementById("element2Container"));
    element1 = null;
    element2 = null;
}
    
function tryToFindRecipes(element1, element2) {
    let result = recipes.get(makeKey(element1, element2));
    if (!result || !elements.has(result)) {
        return null;
    }
    return result;
}
    
async function parseElementsFile(file) {
    try {
        let response = await fetch(file);
        let text = await response.text();

        let lines = text.split('/\\r?\\n/');
            
        for (let line of lines) {
            let words = line.split(' ');
            
            if (words.at(0).includes("STANDARD", 0)) {
                let word = "";
                for (let j = 2; j < words.length; j++) {
                    word += words[j];
                }
                addElement(words.at(1), word, true);
            } else {
                let word = "";
                for (let j = 1; j < words.length; j++) {
                    word += words[j] + " ";
                }
                addElement(words.at(0), word, false)
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    }
}

function addElement(id, element, standard) {
    if (standard) {
        elements.set(id, element);
        playerElements.add(id);
    } else {
        elements.set(id, element);
    }
}

async function parseRecipeFile(file) {
    try {
        let response = await fetch(file);
        let text = await response.text();

        let lines = text.split('/\\r?\\n/');

        for (let line of lines) {
            let words = line.split(' ');
                
            addRecipe(words.at(0), words.at(2), words.at(4));
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    }
}

function addRecipe(element1, element2, result) {
    recipes.set(makeKey(element1, element2), result);
}

function makeKey(element1, element2) {
    let key;
    if (element1.localeCompare(element2) <= 0) {
        key = element1 + "_" + element2;
    } else {
        key = element2 + "_" + element1;
    }
    return key;
}

function howToPlay () {
    let menuContent = document.getElementById('menuContent');
    openMenu()
    document.getElementById('menuButton').textContent = "Понятно";

    let text = document.createElement('p');
    text.textContent = "Совмещай доступные элементы, чтобы получить новые, соединяй новые и так далее...";

    menuContent.appendChild(text);
    
    let gif = document.createElement('img');
    gif.src = "slava-kpss-славакпсс.gif";
    gif.alt = "Гифка с примером игры"

    menuContent.appendChild(gif);

    let head = document.createElement('h2');
    head.textContent = "Как играть?";
    
    menuContent.appendChild(head);
}

function openMenu () {
    let button = document.createElement("button");
    button.classList.add("button");
    button.onclick = () => {closeMenu();}
    button.id = "menuButton";
    document.getElementById('menu').classList.add('active');
    document.getElementById('menuContent').appendChild(button);
}

function closeMenu () {
    document.getElementById('menu').classList.remove('active');

    setTimeout(() => {
        removeContainerElements(document.getElementById("menuContent"));
    }, 500);
}

function clearButton () {
    let menuContent = document.getElementById('menuContent');
    openMenu()
    document.getElementById('menuButton').textContent = "НЕТ";
    
    let button = document.createElement("button");
    button.classList.add("button");
    button.onclick = () => {
        clearData();
        closeMenu();
    };
    button.textContent = "ДА";
    
    document.getElementById('menuContent').appendChild(button);

    let text = document.createElement('p');
    text.textContent = "ХОТИТЕ СБРОСИТЬ ВСЕ НАЙДЕННЫЕ ЭЛЕМЕНТЫ?";

    menuContent.appendChild(text);
}