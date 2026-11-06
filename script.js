

// ======================================
// BOOK FINDER APPLICATION
// ======================================


// ======================================
// LOCAL STORAGE
// ======================================

function getSavedBooks() {
    return JSON.parse(localStorage.getItem("myReadingList")) || [];
}


// ======================================
// CREATE A PLACEHOLDER WHEN A BOOK HAS NO COVER
// ======================================

function createCoverPlaceholder() {

    const placeholder = document.createElement("div");
    placeholder.className = "book-cover-placeholder";

    const icon = document.createElement("span");
    icon.textContent = "📖";

    const text = document.createElement("p");
    text.textContent = "NO COVER";

    placeholder.appendChild(icon);
    placeholder.appendChild(text);

    return placeholder;
}


// ======================================
// SEARCH BOOKS USING OPEN LIBRARY API
// ======================================

async function searchBooks(searchType, searchValue, resultsContainer, messageElement) {

    const search = searchValue.trim();

    resultsContainer.replaceChildren();

    if (search === "") {
        messageElement.textContent = "Please enter something to search.";
        return;
    }

    messageElement.textContent = "Searching for books...";

    try {

        const url = new URL("https://openlibrary.org/search.json");

        url.searchParams.set(searchType, search);
        url.searchParams.set("limit", "20");

        // RETRIEVE FIVE TYPES OF BOOK INFORMATION
        url.searchParams.set(
            "fields",
            "title,author_name,first_publish_year,publisher,cover_i"
        );

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Unable to retrieve book information.");
        }

        const data = await response.json();

        if (!data.docs || data.docs.length === 0) {
            messageElement.textContent = "No books found. Try another search.";
            return;
        }

        messageElement.textContent = data.docs.length + " books found.";

        data.docs.forEach(book => {

            const title = book.title || "Unknown Title";

            const author = book.author_name
                ? book.author_name.join(", ")
                : "Unknown Author";

            const year = book.first_publish_year || "Unknown";

            // RETRIEVE PUBLISHER
            const publisher = book.publisher
                ? book.publisher[0]
                : "Unknown Publisher";

            // STORE BOOK INFORMATION
            const bookData = {

                key: book.key || (title + "-" + author),

                title: title,

                author: author,

                year: year,

                publisher: publisher,

                cover: book.cover_i
                    ? "https://covers.openlibrary.org/b/id/" + book.cover_i + "-M.jpg"
                    : ""

            };


            // CREATE BOOK CARD

            const card = document.createElement("div");
            card.className = "book-card";


            // BOOK COVER

            if (bookData.cover !== "") {

                const image = document.createElement("img");
                image.src = bookData.cover;
                image.alt = "Book Cover";

                image.onerror = function () {
                    this.replaceWith(createCoverPlaceholder());
                };

                card.appendChild(image);

            } else {

                card.appendChild(createCoverPlaceholder());

            }


            // BOOK TITLE

            const titleElement = document.createElement("h3");
            titleElement.textContent = title;
            card.appendChild(titleElement);


            // AUTHOR

            const authorElement = document.createElement("p");
            authorElement.textContent = "Author: " + author;
            card.appendChild(authorElement);


            // YEAR

            const yearElement = document.createElement("p");
            yearElement.textContent = "First Published: " + year;
            card.appendChild(yearElement);


            // PUBLISHER

            const publisherElement = document.createElement("p");
            publisherElement.textContent = "Publisher: " + publisher;
            card.appendChild(publisherElement);


            // ADD TO READING LIST BUTTON

            const saveButton = document.createElement("button");
            saveButton.textContent = "Add to Reading List";

            saveButton.addEventListener("click", function () {
                saveBook(bookData);
            });

            card.appendChild(saveButton);

            resultsContainer.appendChild(card);

        });

    } catch (error) {

        console.error(error);

        messageElement.textContent =
            "Unable to retrieve books. Please check your internet connection.";

    }

}


// ======================================
// CREATE: SAVE BOOK
// ======================================

function saveBook(book) {

    const savedBooks = getSavedBooks();

    const alreadySaved = savedBooks.some(
        savedBook => savedBook.key === book.key
    );

    if (alreadySaved) {
        alert("This book is already in your reading list.");
        return;
    }

    const confirmAdd = confirm(
        'Do you want to add "' + book.title +
        '" to your reading list?'
    );

    if (!confirmAdd) {
        return;
    }

    book.status = "To Read";
    book.pagesRead = 0;

    savedBooks.push(book);

    localStorage.setItem(
        "myReadingList",
        JSON.stringify(savedBooks)
    );

    alert("Book has been added to your reading list.");

}


// ======================================
// READ: DISPLAY SAVED BOOKS
// ======================================

function displayReadingList() {

    const readingList = document.getElementById("readingList");

    if (!readingList) return;

    const savedBooks = getSavedBooks();

    readingList.replaceChildren();

    if (savedBooks.length === 0) {
        readingList.textContent = "Your reading list is empty.";
        return;
    }

    savedBooks.forEach(book => {

        const card = document.createElement("div");
        card.className = "saved-book-card";


        // BOOK COVER

        if (book.cover) {

            const image = document.createElement("img");
            image.src = book.cover;
            image.alt = "Book Cover";

            image.onerror = function () {
                this.replaceWith(createCoverPlaceholder());
            };

            card.appendChild(image);

        } else {

            card.appendChild(createCoverPlaceholder());

        }


        // BOOK TITLE

        const title = document.createElement("h3");
        title.textContent = book.title;
        card.appendChild(title);


        // AUTHOR

        const author = document.createElement("p");
        author.textContent = "Author: " + book.author;
        card.appendChild(author);


        // PUBLISHED YEAR

        const year = document.createElement("p");
        year.textContent = "First Published: " + book.year;
        card.appendChild(year);


        // PUBLISHER

        const publisher = document.createElement("p");
        publisher.textContent = "Publisher: " +
            (book.publisher || "Unknown Publisher");
        card.appendChild(publisher);


        // READING STATUS

        const status = document.createElement("p");
        status.textContent = "Reading Status: " + (book.status || "To Read");
        card.appendChild(status);


        // PAGES READ

        const pages = document.createElement("p");
        pages.textContent = "Pages Read: " + (book.pagesRead || 0);
        card.appendChild(pages);


        // EDIT BUTTON

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";

        editButton.addEventListener("click", function () {

            window.location.href =
                "edit_book.html?key=" + encodeURIComponent(book.key);

        });

        card.appendChild(editButton);

        readingList.appendChild(card);

    });

}


// ======================================
// EDIT BOOK PAGE
// ======================================

function loadEditBook() {

    const editStatus = document.getElementById("editStatus");

    if (!editStatus) return;

    const params = new URLSearchParams(window.location.search);
    const bookKey = params.get("key");

    const savedBooks = getSavedBooks();

    const book = savedBooks.find(item => item.key === bookKey);

    const error = document.getElementById("editError");

    if (!book) {
        error.textContent = "Book not found.";
        return;
    }


    // DISPLAY BOOK COVER

    const coverContainer = document.getElementById("editBookCover");

    coverContainer.replaceChildren();

    if (book.cover) {

        const image = document.createElement("img");

        image.src = book.cover;
        image.alt = book.title + " book cover";

        image.onerror = function () {
            this.replaceWith(createCoverPlaceholder());
        };

        coverContainer.appendChild(image);

    } else {

        coverContainer.appendChild(createCoverPlaceholder());

    }


    // DISPLAY BOOK TITLE

    document.getElementById("editBookTitle").textContent = book.title;


    // SAVE CHANGES BUTTON

    document.getElementById("saveEditButton").addEventListener("click", function () {

        const newStatus = editStatus.value;

        const pagesInput = document.getElementById("editPages");
        const newPages = Number(pagesInput.value);

        error.textContent = "";


        // CHECK EMPTY INPUT

        if (pagesInput.value.trim() === "") {
            error.textContent = "Please enter the number of pages read.";
            return;
        }


        // CHECK NEGATIVE OR INVALID NUMBER

        if (!Number.isInteger(newPages) || newPages < 0) {
            error.textContent = "Error: Pages read cannot be negative. Please enter a valid number.";
            return;
        }


        // CHECK TOTAL BOOK PAGES

        if (book.pages > 0 && newPages > book.pages) {
            error.textContent = "Pages read cannot exceed the total number of pages.";
            return;
        }


        // UPDATE BOOK INFORMATION

        const updatedBooks = getSavedBooks();

        const bookIndex = updatedBooks.findIndex(
            item => item.key === bookKey
        );

        if (bookIndex !== -1) {

            updatedBooks[bookIndex].status = newStatus;
            updatedBooks[bookIndex].pagesRead = newPages;

            localStorage.setItem(
                "myReadingList",
                JSON.stringify(updatedBooks)
            );

            alert("Book information updated successfully!");

            window.location.href = "reading_list.html";

        }

    });


    // DELETE BOOK BUTTON

    document.getElementById("deleteEditButton").addEventListener("click", function () {

        const confirmDelete = confirm(
            "Are you sure you want to delete this book?"
        );

        if (!confirmDelete) return;

        const updatedBooks = getSavedBooks().filter(
            item => item.key !== bookKey
        );

        localStorage.setItem(
            "myReadingList",
            JSON.stringify(updatedBooks)
        );

        alert("Book deleted successfully!");

        window.location.href = "reading_list.html";

    });

}


// ======================================
// BOOK RECOMMENDATIONS
// ======================================

async function recommendBooks(genre) {

    const results = document.getElementById("recommendResults");
    const message = document.getElementById("recommendMessage");

    await searchBooks("subject", genre, results, message);

}


// ======================================
// READING GOAL CALCULATOR
// ======================================

function calculateReadingGoal() {

    const targetInput = document.getElementById("targetBooks").value;

    const completedInput = document.getElementById("completedBooks").value;

    const daysInput = document.getElementById("goalDays").value;

    const result = document.getElementById("goalResult");

    result.replaceChildren();

    const target = Number(targetInput);

    const completed = Number(completedInput);

    const days = Number(daysInput);


    // VALIDATION

    if (

        targetInput.trim() === "" ||

        completedInput.trim() === "" ||

        daysInput.trim() === "" ||

        !Number.isInteger(target) ||

        !Number.isInteger(completed) ||

        !Number.isInteger(days) ||

        target <= 0 ||

        completed < 0 ||

        completed > target ||

        days <= 0

    ) {

        result.textContent =
            "Please enter valid reading goal information.";

        return;

    }


    // CALCULATIONS

    const remaining = target - completed;

    const dailyGoal = Math.ceil(remaining / days);

    const monthlyGoal = Math.round((remaining / days) * 30);

    const daysPerBook = remaining > 0
        ? days / remaining
        : 0;

    const progress = (completed / target) * 100;


    // RESULT CONTAINER

    const box = document.createElement("div");
    box.className = "calculator-result";

    const heading = document.createElement("h3");
    heading.textContent = "Your Reading Goal Results";

    box.appendChild(heading);


    // DISPLAY RESULTS

    const details = [

        "Target Books: " + target,

        "Books Completed: " + completed,

        "Books Remaining: " + remaining,

        "Daily Reading Goal: " + dailyGoal + " books per day",

        "Monthly Reading Goal: " + monthlyGoal + " books per month",

        "Average Days Per Book: " +
            Math.round(daysPerBook) + " days",

        "Reading Progress: " + Math.round(progress) + "%"

    ];

    details.forEach(detail => {

        const paragraph = document.createElement("p");
        paragraph.textContent = detail;

        box.appendChild(paragraph);

    });


    // PROGRESS BAR

    const progressContainer = document.createElement("div");
    progressContainer.className = "progress-container";

    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";

    progressBar.style.width = progress + "%";

    progressContainer.appendChild(progressBar);
    box.appendChild(progressContainer);

    result.appendChild(box);

}


// ======================================
// EVENT LISTENERS
// ======================================


// FIND BOOKS PAGE

const searchButton = document.getElementById("searchButton");

if (searchButton) {

    searchButton.addEventListener("click", function () {

        const searchType = document.getElementById("searchType").value;

        const searchValue = document.getElementById("searchInput").value;

        const results = document.getElementById("results");

        const message = document.getElementById("message");

        searchBooks(searchType, searchValue, results, message);

    });


    // SEARCH WHEN ENTER IS PRESSED

    document.getElementById("searchInput")
        .addEventListener("keydown", function (event) {

            if (event.key === "Enter") {
                searchButton.click();
            }

        });

}


// READING LIST PAGE

if (document.getElementById("readingList")) {
    displayReadingList();
}

if (document.getElementById("editStatus")) {
    loadEditBook();
}


// RECOMMENDATIONS PAGE

document.querySelectorAll(".genre-button").forEach(button => {

    button.addEventListener("click", function () {

        const genre = this.dataset.genre;

        recommendBooks(genre);

    });

});


// READING GOAL PAGE

const goalButton = document.getElementById("goalButton");

if (goalButton) {
    goalButton.addEventListener("click", calculateReadingGoal);
}
