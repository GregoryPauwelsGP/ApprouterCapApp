using my.bookshop as my from '../db/data-model';

service CatalogService {
    @readonly entity Books as projection on my.Books;
    action sendMetadata(metadata : String) returns String;
    action testFunction(word : String) returns String;
    action getFunction();
}