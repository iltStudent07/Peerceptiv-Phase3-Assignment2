# Rationale

## Mongoose Schema Design Descisions

For the schemas themselves I went with fields that I felt made sense for each schema. Consoles I went with fields representing the info that I figured would be needed to keep inventory in a store such as the name of the console, its price and stock amount. I also added an owner field that connects to the User schema (which keeps track of the info needed on a user account for them to log in to the server), this allows for the POST and DELETE routes to be protected. You have to be logged in as a user to create a listing and it attaches that listing to your account. Only the user that added a console to the database or a user with the "admin" role can change or delete listings.

## Implementaion of Query features/ Trade-offs

- Filtering: A user can search by name, brand, or price range, this is allows for quick and easy searches but the tradeoff is that querries could slow down if the database becomes large without adding some sort of database indexing.

- Sorting: A user can sort by the name, brand, price and createdAt fields with the default being the newest entry comes up first. The tradeoff is that you can only sort by one field at a time.

- Pagination: A user can input page and limit to change how a query output appears. The output also shows the total count and page count in the server response. The tradeoff is that as the database gets larger querries can take longer depending on how many pages down a user skips through.

## Authentication Approach
The app uses authentication middleware to allow a user to register an account and log in. Routes are protected by requiring a user to log in before mutating any of the data in the database (POST, PUT, DELETE). Also whenever a listing is made in the database it is attached to the user that created the listing. Unless a user has the "admin" user role, a user can only mutate data attached to their account.

## NoSQL vs Relational Databases
MongoDB is a good choice for when you want a database that is unstructured with the ability to store flexible data quickly. A Relational database(SQL) is better if you need strong data integrity, your data schema doesnt change very often and you need to perform complex JOINs across multiple tables.