class Library {
    constructor(name, location) {
        this.name = name;
        this.location = location;
        this.books = [];
    }

    addBook(title, author, genre, id) {
        this.books.push(new Book(title, author, genre, id));
    }
}

class Book {
    constructor(title, author, genre, id) {
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.id = id;
    }
}

class LibraryService {
    static url = 'https://66509b27ec9b4a4a6032b24f.mockapi.io/libr/Library';

    static getAllLibraries() {
        return $.get(this.url);
    }

    static getLibrary(id) {
        return $.get(this.url + `/${id}`);
    }

    static createLibrary(library) {
        return $.post(this.url, library);
    }

    static updateLibrary(library) {
        return $.ajax({
            url: this.url + `/${library.id}`,
            dataType: 'json',
            data: JSON.stringify(library),
            contentType: 'application/json',
            type: 'PUT'
        });
    }

    static deleteLibrary(id) {
        return $.ajax({
            url: this.url + `/${id}`,
            type: 'DELETE'
        });
    }
}

class DOMManager {
    static libraries;

    static getAllLibraries() {
        LibraryService.getAllLibraries().then(libraries => this.render(libraries));
    }

    static deleteLibrary(id) {
        LibraryService.deleteLibrary(id)
            .then(() => {
                return LibraryService.getAllLibraries();
            })
            .then((libraries) => this.render(libraries));
    }

    static createLibrary(name, location){
        LibraryService.createLibrary(new Library (name, location))
        .then(() => {
            return LibraryService.getAllLibraries();
        })
        .then((houses) => this.render(houses));
    }

    static addBook(id) {
        for(let library of this.libraries) {
            if (library.id == id) {
                let bookID = this.generateID();
                library.books.push(new Book($(`#${library.id}-book-title`).val(), $(`#${library.id}-book-author`).val(), $(`#${library.id}-book-genre`).val(), bookID));
                LibraryService.updateLibrary(library)
                .then(() => {
                    return LibraryService.getAllLibraries();
                }) 
                .then((libraries) => this.render(libraries));
            }
        }
    }

    static generateID (braces, upperCase) {
        var randomGuid = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx".replace(/x/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        if (braces === true) { randomGuid = "{" + randomGuid + "}"; }
        if (upperCase === true) { randomGuid = randomGuid.toUpperCase(); }
        return randomGuid;
    }

    static deleteBook(libraryId, bookId){
        for(let library of this.libraries) {
            if(library.id == libraryId) {
                for (let book of library.books) {
                    console.log(book._id);
                    if (book.id == bookId) {
                        library.books.splice(library.books.indexOf(book), 1);
                        LibraryService.updateLibrary(library)
                        .then(() => {
                            return LibraryService.getAllLibraries();
                        })
                        .then((libraries) => this.render(libraries));
                    }
                }
            }
        }
    }

    static render(libraries) {
        this.libraries = libraries;
        $('#app').empty();
        for (let library of libraries) {
            $('#app').prepend(
                `<div id="${library.id}" class="card">
                    <div class="card-header">
                        <div class="row">
                            <div class="col-lg">
                                <h2>${library.name} | ${library.location}</h2>
                            </div>
                            <div class="col-sm">
                                <button class="btn btn-danger" onclick="DOMManager.deleteLibrary('${library.id}')">Delete Library</button>
                            </div>
                        </div>
                    </div>
                        <div class="card-body inputfields">
                            <div class="book-input">
                                <div class="row">
                                    <div class="col-md">
                                        <h3>Add a Book</h3>
                                    </div>
                                    </div>
                                <div class="row">
                                    <div class="col-sm">
                                        <input type="text" id="${library.id}-book-title" class="form-control" placeholder="Book Title">
                                    </div>
                                    <div class="col-sm">
                                        <input type="text" id="${library.id}-book-author" class="form-control" placeholder="Book Author">
                                    </div>
                                    <div class="col-sm">
                                        <input type="text" id="${library.id}-book-genre" class="form-control" placeholder="Book Genre">
                                    </div>
                                    <div class="col-sm">
                                        <button id="${library.id}-new-book" onclick="DOMManager.addBook('${library.id}')" class="btn btn-info form-control">Add Book</button>
                                    </div>
                                </div>
                            </div>
                        </div>
              </div><br>`
            );
            for (let book of library.books) {
                $(`#${library.id}`).find('.card-body').append(
                    `<div class="row book-info">
                        <div class="col-lg">
                            <div class="row">
                                <div id="title-${book.id}" class="col-lg"><strong>Title: </strong> ${book.title}</div>
                                <div id="author-${book.id}" class="col-lg"><strong>Author: </strong> ${book.author}</div>
                                <div id="genre-${book.id}" class="col-lg"><strong>Genre: </strong> ${book.genre}</div>
                            </div>
                        </div>
                        <div class="col-sm">
                            <button class="btn btn-danger" onclick="DOMManager.deleteBook('${library.id}', '${book.id}')">Delete Book</button>
                        </div>
                    </div>
                    `
                );
            }
        }
    }
}

$('#create-new-library').click(() => {
    DOMManager.createLibrary($('#new-library-name').val(),$('#new-library-location').val());
    $('#new-library-name').val(''), $('#new-library-location').val('');
});

DOMManager.getAllLibraries();