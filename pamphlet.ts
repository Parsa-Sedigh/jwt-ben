/* We're gonna integrate authentication with JWT. We're gonna do this in a way where we store the access token in memory and this is a more
secure way of doing it.
Typegraphql allows us to integrate typescript and graphQL together on our backend.
We're gonna use apollot to make reqs in react and we're also gonna use it as our server with express.

What we're gonna do:
Backend:
1. setup a graphql server using typescript and typeORM
2. register a user(create user in DB)
3. login and create access and refresh tokens(login users and get them access tokens and create refresh tokens )
4. authenticated mutatitons/queries(create routes in graphql and how we can protect them)
5. refresh the token(if it expires)
6. revoke tokens for a user(revoke a refresh token for a specific user or revoke all the refresh tokens for a specici user. So if that user
   logs out or forgets his password, their account shouldn't get hacked, so we wanna invalidate all the sessions)


Frontend:
1. setup apollo and graphql code generator(the graphql code generator gonna allow us to easily create queries and mutations that are type safe, because
   we're using typescript)
2. react router
3. register/login(and how protect those routes)
4. persisting session on refresh(so when they refresh the page, we're gonna make sure that the user is still logged in in their account)
5. handling expired tokens(so we're gonna handle what happens when we make a request and token is expired. So how can we refresh the access token, but
   the user doesn't even realize it, they're not even logged out, we just automatically and in the background handle this)
6. fetching current user in header, etc ...

Let's start with backend. We're gonna be setting up the graphql server and typeGraphql and typeORM. We're gonna create some boilerplate code
from typeORM to do this and to do this, we need to install the typeORM CLI. So run: npm i -g typeorm .
Now run: typeorm init --name server --database postgres , in this command, we're gonna call our project, `server`.

Now if package.json dependencies is empty, add: typeorm, reflect-metadata, pg as deps and ts-node, @types/node, typescript as dev deps and
an npm script of: "start": "ts-node src/index.ts".

Now run: npx tsconfig.json and in this case, select node as type of project(do this inside of server project root folder, which in this case
is server folder, so cd inside this directory and then run this npx).

Maybe when you ran typeorm, you get an out of date package.json and when you have a out of date package.json , you can update all of the deps
inside of it, by running: yarn upgrade-interactive --latest and you select the packages you want to update by hitting spacebar.
For installing deps with yarn run: yarn .

ormconfig.json has information to connect to DB.

Now in server folder run: createdb `<name of db you have in ormconfig.json>`
Now you can run: npm start.
Now the typeorm setup is done.

Now we wanna setup our graphql server. So install: npm i express apollo-server-express graphql
Then we need to install the types(autocompletion) for express and graphql(apollo(apollo-server-express) already comes with types).
So run: npm i --save-dev @types/node(doesn't need this, we already have it) @types/graphql @types/express
Whenever you wanna work with typescript and node, you'll need @types/node.

Now use express() to create a server in src/index.ts file(which we already have this file and it has some boilerplate code related to typeorm).

Now let's create an async await IFEE in index.ts (I commented out the boilerplate in index.ts) .

() => {} is a lambda fucntion.
We're gonna put all of the logic to start stuff in (async () => {})(); function of index.ts . So now put const app = express() there and other stuff too.

Whenever you wanna igonre a parameter of a function to passing to it, we usually put underscore for variable name.

Now the express is running, we need to intergrate the graphql portion. Start by creating an instance of ApolloServer(you can keep the express routes,
so you can keep sth like: app.get('/', (req, res) => {...})).
typeDefs for ApolloServer() is where we define our graphql schema with a string.

We define our graphql stuff with the object we pass to ApolloServer() and then, with apolloServer.applyMiddleware({app}); , we add
our graphql stuff to our express server(app is result of calling express()).

Now you need to restart the server by running: npm start(which runs ts-node for index.ts file).
Now restart the server.
Now if you go to: localhost:4000/graphql , we should see graphql playground.

So now express and apollo are set up. Now let's setup type-graphql.
This way of coding in graphql:
resolvers: {
            Query: {
                hello: () => 'hello w orld'
            }
        }
is a valid way of doing graphql, but when you start doing typescript stuff, it's harder to get the types working and you would do some
duplicate code and therefore, we can use type-graphql yo make this easier. So install type-graphql.
Now, instead of creating our schema like this:
{
        typeDefs: `
            type Query {
                hello: String!
            }
        `,
        resolvers: {
            Query: {
                hello: () => 'hello w orld'
            }
        }
}
,
we're gonna create it, in a different manner. Now let's create a file named UserResolver.ts . So now we can create our graphql schema inside of
the class of that file and as we create it,  tyoe-graphql will check both our graphql types and our typescript types for us.

By passing a function to @Query(), we can tell what type it returns and for specifying the type, you need to write the type with first letter as
capital.

So now, instead of passing typeDefs and resolvers to ApolloServer(), we did the equivalant of passing those things to ApolloServer(), in our UserResolver
class. So remove those typeDef and resolvers object from passing to ApolloServer() and instead pass the schema object and for it's value, we're gonna
await for building the schema. Remember to import buildSchema() from type-graphql and not graphql.

buildSchema() takes our resolver classes and it's gonna create a graphql schema out of them.
Now restart the server and then refresh the graphql playground.

Now let's create our register mutation. In graphql we use mutations when we want to update sth, create sth or basically make a change to our DB.
So let's add a mutation to the UserResolver class.

In @Arg('email') email: string, the string we passed to @Arg() , is the name of graphql arg, so that is what the user will actually pass in and after that,
we put our variable name, which in this case is email(the name after @Arg()) and that string keyword, is that typescript type. Type-graphql can
infer what that string type(typescript type) is, but if it can not infer, we pass a function to second arg of @Arg() which in this case should be:
() => String and with that, it will automatically know. So this function in this case, is explicitely saying that that argument is of type Stirng. So:
@Arg('email', () => String) email: String , but we didn't use it in our code.
Now inside of that method, I wanna create my User in DB. So let's go to entity/User.ts . In entity class, you add fields and eacch field usually
maps to a DB column.
Now in that entity class, you need to extend the BaseEntity class, this was just a typeORM thing that allows us to do commands on class of that
entity. So now we can do: User.save() (it's called the active record pattern).

By annotating a class with @Entity(), we say that that class is a DB table.
We can explicitely specify the name of our table by passing a string to @Entity() . By doing that, we wouldn't have a conflict with the User table which
if we didn't pass that name explicitely, a User table would be created.

Now we need to tell typeORM to create that users table and let it know that that Entity or table exists.
In ormconifg.json , we have entity mapping with entities property which points to where all of our entities exists. That's how typeORM knows about out
entities. Now in the index.ts , we just need to create a connection. So we need to use createConnection() function of typeORM.
So now the connection is created and it knows where entities are and it knows what the connection information is, all from the ormconfig.json .
So if any of that stuff is wrong, ormconfig.json is where you go to fix it.
So we create a db connection, we have our db setup(with entities and ...) and we also have setup to synchronize(the property inormconfig.json).
What synchronize option gonn do, is it's gonna automatically create the DB tables for us.
So now in resolver classes, we can do CRUD tasks like: await <entity name>.insert() .

In register() method, we don't want to just insert the user's password, instead we wanna first hash it before passing the password to the object we
pass to insert() . So we need to install bcryptjs or argon and then install the types for the package that you installed, by saying:
npm i --save-dev @types/<package name>. Why?
Because some libraries come with typescript type and some don't like bcryptjs, so we need to install the types separately. Now let's use the
hash() function of bcryptjs.

When you have sth like:
@Column()
    password: string;
The database column would automatically inferred that that column should be a text column, but if you want, you can explicitely say
it's a text column by passing text to @Column() . So you can explicitely say what the datatype your column should be by passing that type to @Column() .

Now the register Muatation is added to DOCS tab in graphql playground.

Now we wanna speicy what our register() mutation gonna return and we specify it in () of @Mutation() and in case of register() , we can return
a boolean that indicates whether it worked or not. So pass a function to @Mutation() that returns the type you want that @Mutation() to return.

Notice that we're constantly starting and stopping server. So let's install nodemon and then in start npm script add: nodemon --exec <previous command> .

Now for testing the register mutation, in graphql playground write:
mutation {
    register(email: "bob@bob.com", passowrd: "bob")
}

users Query in UserResolver.ts , is a query that finds all of our users in DB and then returns them, so we're gonna return an array of users, so for
returning type of that query which is specifed as return statement of the function we pass to @Query() , we write: [User]. Now if you hold command and then
click on User in [User], it transports you to User entity class. So we can actually use this type as a type-graphql type and the way we do this, is by annotating
that entity class with @ObjectType() and then annotate the fields of that entity with @Field() . With @Field() on a column in entity class,
we expose that column. But I don't wanna expose the password column(which contains hashed password values), so I didn't add @Field() on password column.
Also it's going to infer the string type, but it can't infer number type for a column, because it doesn't know whether it's an integer or a float. So
we need to explicitely specify the type for number columns on their @Field() . So give @Field() a function that returns Int(which is coming from type-graphql).
if you didn't add that @ObjectType() and didn't set a graphql type like Int type from type-graphql, you would get this error:
UnhandledPromiseRegectionWarning: Error: Cannot determine GraphQL output type for users.
This error would happen whenever you don't explicitely the type as an @ObjectType() in entity class, when you use the entity type(like User entity type) in your
So when we want to use the entity class type as a grapqhl type in @Query() which should be in resolver file of that entity, we need to add @ObjectType() to
entity class itself and also @Field() to the columns that we wanna expose and also if it has some types that can not be inferred, we need to explicitely
add the types of those columns to @Field() by passing a function that returns the type of that column.
In this case, we use User type in a type of an array of Users([Users]) in resolver file and therefore we needed to add @ObjectType() to entity class of User
and also @Field() to column of that entity that wented to expose.
The returning type of users() @Query() is crucial. Because we wanna return multiple Users, so an array of Users, so we need to specify the type: [User] and not
User.
Now let's write a query in graphql playground for getting all of the users(the users query), actualy we wanna grab the id and email field, so write:
ex)
users {
    id, email
}

That is how we register users. Now let's login the users that are registered and give them an access and refresh token.
To do this, we're gonna create a new mutation. The first thing we're gonna do in login() method, is see if the user with that entered email and password
exists. So we need to use findOne() method of typeORM. So we're gonna search for the entered email in our DB.

Next, we need to compare the entered password and the found password with that email and see if they passed in the right password. So we need the compare()
function of bcryptjs.
Now if until now, no error would thrown, it means the user successfully logged in, so at this point we want to give them tokens so that they can
stay logged in and and they can use that to access other parts of our website or our API or our graphql schema. So we need to return the access token there.
So we're gonna return the accessToken but for refreshToken, we're gonna return it in a different place.
Now let's specify the mutation type(the type that our mutation returnes) which we specify it in the returning value of function we pass to @Query() .
So we need to create a new @ObjectType() called LoginResponse. Remember that we need to annotate a class with @ObjectType() and in this case, the name of 
that class is LoginResponse and this class just returns property called accessToken which is a string and don't forget to annotate that property with
@Field() which means it is a type-graphql field. So LoginResponse is what we're gonna return from login mutation. So return the LoginResponse class from
the function you pass to @Mutation() and if you want to ALSO the typescript checking it, you can specify it as return type of login method. So put LoginResponse
as return type of promise of login() method. So: login(): Promise<LoginResponse> {} .

By specifying the returning type of the passed function to @Mutation() , we tell type-graphql, what the graphql type is. In case of:
EX) @Mutation(() => LoginResponse)
it is an object which has a single field called accessToken which is a string(we defined these in @ObjectType() LoginResponse {}) and by specifying that
Promise<LoginResponse> type for return type of login, we tell to typescript to verify that wer'e returnign a promise of the type LoginResponse.

For value of accessToken, let's install jsonwebtoken which helps us create and validate JWTs. Also don't forget to install the types package for it too.
With sign() function of this package, we can create a token. The payload which is an arg we pass to this function, is what we actually want to be stored inside
of that token which we're creating it. In case of login() , we want to store the userId, second param of sign() is the secret which is a random string
and we can just create it if we want to. But you need to store it somewhere, because that is the secret that we use to verify whether the token is valid or not.
The third arg is an object for options and in this case, the thing that we care about in this case is the expiresIn.
In general, we want our accessToken to set and be valid in a shorter time. So like 60 minutes or a week is probably too long. We may come back and change it
to sth even shorter for testing.
Hit refresh in graphql playground to see the new login mutation DOC.
So now let's create a new mutation for login and ask for accessToken and test it with incorrect and correct credentials.
ex)
mutation {
    login(email: 'bob@bob1.com', password: '') {
        accessToken
    }
}

Now we want to create a refreshToken as well. RefreshToken is a little bit different because we want to store it in a cookie. So to store in a cookie,
we need to use the res object of express and call .cookie() on it. To get access to res, we need to access the context or passes in through the context
in graphql. So how do we do this?
Add context property to the object you passed to ApolloServer() and in that property, we destructure the object that the function you pass to context, receives and
we pull out the res object from it. Also you can pull out the req passed to the function we pass to context property, too.
With  context: ({req, res}) => ({req, res}), the req and res are now inside of our context. So now in our graphql resolvers we can access
both of those.
We also need to create a context type. So I created MyContext.ts file(this is just for typescript purposes).
Now in UserResolver, we can use our context by using @Ctx() to access the context which would contain the req and res in an object(we just need
res in case of login()), so we can destructure that receive object. @Ctx() is just for type-graphql to get us access to the context.
We're storing refreshToken in cookie. In refreshToken we're gonna store the userId again(like what we did for accessToken), so we can know
who this is for?
For the secret for refreshToken, you wanna put a DIFFERENT secret that the one you used for accessToken.

jid: generic id name , with this, no one knows what the heck it is.

The shortest value for expiresIn of refreshToken can be 7 days. So if the user hasn't access your site for some amount of time. In this case,
if the user hasn't visit our website in a week, we make them re-login . 
In third arg of .cookie() you specify options for the cookie itself. With httpOnly: true, it cannot be accessed by JS. Later, we're also gonna set the
domain and path. So the optiosn that you specify in the third arg of res.cookie() is options you have available, when you create that cookie.

Now we need to get our cookie back. So open the devtools and in network tab, not if you send the login req in grapqhl playground, it should give you an
object with a property named data which has an object and in that object it has a property named login and in the object of it, it should have the accessToken(you
can see this in preview tab of clicked response) and then if you go to Cookies tab of that login request, you can see we get a cookie back and in there,
you can see the Response Cookies which it's name is 'jid' and ... . Sometimes you have to mess with CORS to get this working. For this, go to settings of
graphql playground and set: "request.credentials": "include" which by default is set to "omit" therefore, by deafult you can't get the cookies back until
you set this to "include".
In my case, even by "omit" I could get the Response Cookies.
There's a task going on in the background and you can see it in the network tab which the name of it is graphql. So be careful to click on your OWN
ent request and not that running task.

Also in Headers tab of the request and in it's Response-Headers, you should see the Set-Cookie set to a long string and at the end of it, you should see
path=/; HttpOnly.
If you can see these, it means you're correctly sending cookies back. But you will not get a cookie back if the "request.credentials" is set to "omit" .

So now, we have successfully logged in the user and and sent him back a refresh token in format of cookie and an accessToken in format of response of the request.
Now we need some cleanup. Because we're currently putting the creation of the tokens(like: sign({}, ...)) inlined in the code in the UserResolver, but
we want to abstract them into their own function and treat the secrets in a better way and not just write them inside the code directly, I wanna store
them in environment variables. It is a good place to put them, because you don't want anyone else seeing your secret strings and also you may wanna use
different secrets in development vs production.
So create auth.ts in src folder.

When you don't get autocompletion in vscode, you can hit command + p and then hit > , or command shit p which automatically add the caret(>) for you and then
type reload window and it will also get rid of your terminals.

Now let's create a .env file and store the env variables. Now to READ those env variables or that env file, install dotenv package as a dev dep. Then in
index.ts , import that .env file. Now this package like: import 'dotenv/config' and note that we put it as the first import statement, is
gonna read the variables in .env file and to make sure that worked, you can log:
process.env.<variable name>.

Note: Create the .env file in root of the project(in this case, in root of server folder), if you don't do this and put in in nested directories like
src folder, it would give you undefined for values of env variables. Now use those env variables in auth.ts file.
Now typescript gets mad by putting an env variable like process.env.ACCESS_TOKEN_SECRET as an arg to a function that expects a string as that arg,
because it's possibly undefined and for resolving this, we can put an exclamation mark at the end of that process.env.<env variable> , to say that
we know it's defined.

Now we're passing tokens back, we kind of have authentication that we can do now for routes. So we can create a route and protect it. For example,
let's create a method in UserResolver named bye() . So let's say we only want users that are logged in to be able to access that @Query() . To do this,
the easiest way is to check the accessToken is in the header and then VALIDATE if it's correct. Now to able to repeat that logic easily, we're gonna stick
in a function and we're gonna stick it in some middleware to make it easy. So we use @UseMiddleware() on bye() method and you can pass a function to that
@UseMiddleware() annotation that gets access to the variables in context and it can check whether the user should have access to this @Query() .
If you create that function DIRECTLY or INLINE in the () of @UseMiddleware() , you can get the type defintions automatically.
What return next() does, is it returns the actual resolver and goes to the next middleware. so next() is what tells you that you're done with the
current middleware logic. So you wanna make sure that you have that at the very end of all your middlewares.
Currently we don't have access to the context value(actually we don't get autocompletion for context) in that function, actually let's create a separate
function as the function we pass to @UseMiddleware() , so let's create isAuth.ts and there, as type of that isAuth function, we need to pass MyContext
as generic type of MiddlewareFn. By doing this, we get autocompletion for context.req and ... .

In isAuth, we expect the user to send a header called authorization in format of: bearer <token>.
I added an if check to check if the authorization was empty or not before using it in that try block, because it may be undefined and ts would throw
error at us if we didn't add that if check which it say: authorization is probably undefined.
Now we need to parse the received token in try block of isAuth. For that, we use verify() function.
With that try catch block in isAuth, if sth went wrong for whatever reason, like we could not get the payload, or
another reason could be the token could not be split, or maybe it verified it and the token was bad, all these things means that the user
did not gave us a good token and they're not authenticated and we throw an Error() in catch block.
Note: verify() throws an error if it is expired or invalid and then it's gonna return either a string or object and for case of object, it means the payload.
Important: The payload is what we pass as first arg of sign() and that is an object, which for example in case of createAccessToken() , it is an
 object with userId in it. Also the same secret that we use to sign our token, we have to use to verify it.
Now we need to store the payload so we can access it later by saying: on context by saying: context.payload = payload;
So now in the resolver, we can access that payload which has the current userId of user which is on the context.
If the user is loggedin, that payload is there.  

In resolver and in bye() @Query(), if we didn't get a payload then isAuth is gonna throw an error in catch() block, so it's not even gonna get
to the body of bye() , because if you throw an Error() , it would stop executing that function and the body of bye() would not get even executed.

so we can do write: payload!.userId and it should be not undeinfed.

So now if you request for bye() in playground and you don't have good authorization header, it would throw an error that says: not authenticated.
Then you can try to add headers in that bottom editor in playground by saying for example:
{
    "authorization": "..."
}

That is how we can authenticate different queries or muatations.
You can do different things depending on what happend with the token, so maybe the token expired, maybe it's invalid, maybe it's malformed, maybe
it has the wrong secret.
So now we can add isAuth function which we can add to any query or mutation and it's gonna run before our resover(like bye()) and what it does,
is it's gonna read the header and verify that the header itself and the token itself is correct(with verify()) and if it is correct,
it's gonna set the payload inside the token(because we know that when we sign token, it's gonna save some payload, like in our case, the userId) to the context
and that way we can access it inside of our resolvers, so we can access the values stored in the token, in our resolvers. So we can authenticate
different routes or resolvers in graphql.

Now we wanna handle the case where we make a request and our token has expired, since our accessToken only lasts for 15 minutes, we need a way to pass
a refreshToken in and get a new accessToken and we're not gonna do this using graphql. Because basically we only wanna our referesh token be sent,
for this particular request and so for our cookie only to be sent on a single route or request, we need to give it a specific path. So we're gonna
create a special route in express that handles refreshing. So create:
app.post('/refresh_token');
So that particular route is specifically designed to handle refereshing the JWT token and we don't want to go to /graphql(because that's our
normal route which we go to), so we can say our cookie only works on that express route and that helps with security purposes where our token only
gets sent ONLY when we're refereshing. So that' why we're not doing it with grapqh, because we wanted to make a special route for it.
In that special express route, we need to read the referesh cookie and we need to validate that that token is correct and then we can send them back a new
accessToken.

What req.headers does, is we can just get the headers that are sent to that POST route(in the case of /refresh_token).
For testing this route, we're no longer gonna be using that graphql playground, but we can use postman. After sending the request, look at the terminal of
your server!
For adding a cookie to a request in postman, you can click on cookies link under save button in right side. In the cookies tab, add localhost as domain and
then for this domain add a cookie, in there, you would see sth like: Cookie_1=value; Path=/; Domain=localhost; Expires=Tue, 06 Sep 2022 17:01:29 GMT;
Now instead of Cookie_1 type `jid` and it's value gonna be just a random string(for now!) , now after sending a request, the request-response cycle gonna
stuck because we didn't write a code for sending back a response, now look at the terminal of your server.
Now in that req.headers, you would have a property like: cookie: 'jid=asdasd' . So the cookie is being send correctly.

Now we need to isntall a library that will parse this cookie and put in into an object which the library is called cookie-parser and then install the types
for it which is called: @types/cookie-parser.
cookieParser is an express middleware and we use it in app.use() in index.ts and we want this middleware to run before any of your routes, so I put it before
app.<method>() . So app.use(cookieParser()) is gonna parse the cookie string(from req.headers) and put it in req.cookies in shape on an object
which the cookie names would be name of properties in that req.cookies object which we can now use it.
If they weren't send any token in cookies, we don't send them back any accessToken so we make it an empty string.
Now if we pass that if statement, it means we got a token back, now we want to validate that the token is actually sth that WE created.
So inside of that try block, we need to make sure that that secret(process.env.REFRESH_TOKEN_SECRET) was used to sign that token(first param of
verify()) and token hasn't expired.
Now if we get pass that try catch block, we know that the token is valid and we can send back an accessToken and there, we can use the userId inside payload,
to get the current user.
Also we added another check for existance of user there too, though we should get a user from that payload's userId, because if it made it to that point,
it should have a userId and we should get the current user from it!

Reacp what we did in /refresh_token route handler:
First we read that cookie with name of jid, which should be our refreshToken value and then we make sure we actually get a token with if (!token) {} check.
Then in that try{}catch(){} , we make sure that the token has not expired and it's valid and if there's some error with it, we return we ok set to false.
Then(if we pass try catch block) we use the payload(it was set inside that try block)

Remember: We stored a userId in our payload(look at auth.ts), so it's available on that payload in that route handler and we use that userId in payload to
fetch the related user in our DB and if we find the user, we create a new accessToken for them by using createAccessToken() .

In this case, if the ok property of response if false, the retrned accessToken from server(us) would be false and it makes sense, because user didn't send
a good token to get a new accessToken.

Now you can use login method in graphql playground to get a new accessToken and set it back to server to get a new ACCESSTOKEN! Yes! It doesn't make sense.
Because if we want to get a new accessToken, we need to send a refreshToken and not another accessToken, so this should not work, because it is
using the wrong secret. Because we sent a accessToken which would match with the access token secret(because it was actually created with that SECRET_ACCESS_TOKEN)
and therefore shouldn't match with REFRESH_ACCESS_TOKEN.
So the problem here is that we sent an accessToken to get a new accessToken! and this shouldn't work, because it was generated from ACCESS_TOKEN_SECRET but
in that handler, we're matching it(in verify()) with REFRESH_TOKEN_SECRET! So in this case, it would throw an error which says: 'invalid signature', because
it was assigned with the wrong secret.

Now if you send another login request in graphql playground and after getting the response, go to network tab and then in it's Headers tab, see the
Set-Cookie key-value pair(also you can get this value from Cookies tab and in Response Cookies value too!), copy that token and pass it in cookies tab of postman,
now we expect to get a new accessToken back. So we used that refreshToken that we got when we logged in and it gave us back a new accessToken.
As long as our refreshToken is valid, we can get a new accessToken through this route.
Another thing that we COULD add in handler funcrion of /refresh_token , is whenever they refresh their accessToken, we can ALSO refresh the refreshToken
itself. Because their refreshToken could expire in (currently) 7 days. So we need to use createRefreshToken() in that route handler.
So if we ever refresh the accessToken, we should also give them a new refreshToken, so this means that the user could be stayed logged-in for longer than
7 days, if they continually use the website.
We could also split that res.cookie() for creating refreshToken , into a separate function. So create sendRefreshToken.ts file.
So now whenever our accessToken expires, we can call this endpoint and we can send our refreshToken and it'll send us back a new accessToken.

Now we're gonna setup a system where we can revoke these refreshTokens.
The idea is if the user maybe forgets his password or maybe their account gets hacked, we want to revoke all the sessions that user has and there's
a couple ways we can do this:
We can setup like a blacklist or a whitelist of the tokens that we used or, another way, is that we keep the version of a token and we can increment
this version that will invalidate all the old tokens and that's what we're gonna implement.
First, add a new field to User entity named tokenVersion.
Now whenever we create a refreshToken, we're gonna pass what the current tokenVersion is. So in place where we create an accessToken, let's pass a
tokenVersion to the token too. So go to auth.ts and pass the tokenVersion field of User entity to accessToken.
The chain of logic here is:
The tokenVersion starts at 0, so we're gonna save 0 inside of that token, then, when we refresh the token(which we're doing in index.ts), we're gonna
check if the version matches the version saved in the User. So if we found the user(which means we passed that if(!user) {}) check, we're gonna add
another check which is: if (user.tokenVersion !== payload.tokenVersion) {...} and if this if statement is true, it means the token is invalid. 

Now all we have to do to invalidate the tokens for our particular user, is we change the tokenVersion.
Now in UserResolver, create a new mutation.
This muatation is not sth we normally expose to other people to be able to revoke the tokens for somebody, but in this particular case,
this will be simplest for us for just testing purposes. So don't make a mutation like what we're gonna create, but instead, create
a function that you can call, for example on forget password or that you can internally use, if someone's account gets hacked.
We named this muation: revokeRefreshTokensForUser and there, we just want to increment the tokenVersion.
In first arg of increment() , we say how we find it and in second arg, we specify the field we want to increment and in third arg, we say by how much
we want to increment.

So let's say the user come in and login and they get a refreshToken and an accessToken. So you can go to Set-Cookie in Headers tab of Network tab and then
you can go to jwt.io and there, they allow you to paste your jwt and you can see what the payload is and then in postman, you can paste the refreshToken you
copied and then request new accessTokens(in /refresh_token) and as long as our refreshToken is valid, we can do this as many times as we want(so we can
request new accessTokens with our refreshToken).
Now we want to revoke this refreshToken, we're not gonna actually revoke this specific token but we're gonna revoke ALL refreshTokens that
this user has. So in graphql playground, create a new mutation for this request.
Now if we run revokeRefreshTokensForUser mutation, it returns:
{
  "data": {
    "revokeRefreshTokensForUser": true
  }
}
now what should happen is, when we try to refresh our token, it's gonna see in index.ts that the tokenVersion inside of the jwt(payload.tokenVersion) is 0,
but we just increment it to 1 on our user(in db). So now if after doing this, you go to postman and send a request for getting a new accessToken to
/refresh_token , it's gonna send ok: false and it means that you can't refresh with that token anymore. So this is a way to wipe out all
the sessions for a particular user.
Note: As long as that user has an accessToken, they can still do things. So what this will do, is if you revoke sessions for a user, it's gonna be
at most 15 minutes the user can still access the api and this is based off the amount of time you pick for createAccessToken() in auth.ts .
So if we revoke all the sessions for a user, or all the refreshTokens, they can STILL access the api with their accessToken for 15 minutes.
Now, when we login, the new refreshTokens that we're creating, are with an incremented tokenVerison. So after a revoke, if you again login,
the payload inside refreshToken has an incremented versionToken. For testing that, go to network tab>Headers>Set-Cookie and grab the value of
jid(the refreshToken value) and paste it in jwt.io and you can see it has an incremented tokenVersion.
With this, you can also keep track of how many times has a user's account needed to forget his password or they have their account hacked which you needed
to revoke all the refreshTokens.
So this was how we can revoke refreshTokens.

Let's see how we can authenticate in react. So on root of project run: npx create-react-app web --template typescript
First thing that we wanna do is to set up Apollo and be able to make a request to our server.
You can delete App.css and App.test.tsx and index.css and logo.svg and service-worker.ts and readme and also clear all of the html in App.tsx and then run:
npm start.
To add apollo to web project, run:
npm i apollo-boost @apollo/react-hooks graphql
Then we also need to install the types for graphql, apollo already comes with types, so we don't need to install it for that library.
So run: npm i --save-dev @types/graphql
Now import ApolloClient from 'apollo-boost'; in index.tsx of web project.
Now if you hover over ApolloClient, we can see if ts is picking stuff up and if you see a `loading...` when you hover over it and it looks like
it's not working, in vscode, you can hit cmd+shift+p and type: typescript restart server which is the `Typescript: Restart TS server` command and that
usually fixes stuff. It sometimes fixes things when auto imports aren't working in vscode too.
Now create the apolloClient in index.tsx by using new ApolloClient() and pass it the url to our sever by using uri property.

Then we need to wrap our entire application in an ApolloProvider.
Now in our project, we can use the @apollo/react-hooks library and make reqs to our server.
You can go to graphql playground and copy the query for request from there, because they get auto-completion and it's syntax highlighting is easier
to write.
So let's write a query called hello there like:
{
    hello
}
and run it and it should get:
{
    "data": {
        "hello": "hi!"
    }
}
Now copy that request query and paste it inside backticks of useQuery() in App comp.

We also have to setup CORS in our server, later, because it's working currently and if we hit a problem with it, then, we're gonna implement it.

So because we have setup apollo on our client, we're able to request a graphql endpoint from our server.

Now we're gonna setup graphql code generator. For this. we need to install command line for client and run:
npm i --save-dev @graphql-codegen/cli

Now we need to initialize our project with this new package.
Let's create a folder named graphql under src and inside of it, we can put all of our queries, like the hello query, would go to it's own file named
hello.ts and what it's gonna do is it's gonna read that graphql query that we wrote in hello.ts and it's gonna create a component for us and in this
case, it's gonna create a hook.
The code of hello.ts would be:
import gql from 'graphql-tag';

export const helloQuery = gql`
    {
        hello
    }
`;

Now let's instead create .graphql file for hello, instead of .ts . So it's syntax gonna be different.
So now we can say: npx graphql-codegen init . Now for answering the schema question, write: http://localhost:4000/graphql
Then it asks: where are operations and fragments?(so it's asking where are all your queries and mutations?) write: src/graphql/*.graphql

For plugins question, check these three:
Typescript
Typescript operations
so we don't need Typescript react apollo(typed components and HOCs)
Ben wasn't sure we needed the last plugin or not, so if we don't need it, we can remove it later.
You can hit space to toggle those radio buttons in cli, on or off.

Where to write the output? We can use the default, you can hit enter to keep the default value for that question. The default value for this
question is: src/generated/graphql.tsx
Do you want to generate an introspection file? n
How to name the config file? Hit enter(keep the default which is codegen.yml)
What script in package.json should run the codegen? gen

Now, we have a codegen.yml and in our package.json of web project, we should have a script called gen and also three new dev deps:
@graphql-codegen/typescript
@graphql-codegen/typescript-operations
@graphql-codegen/typescript-react-apollo
and also the @graphql-codegen/cli itself as dev dep.
Now run yarn or npm i to install those deps that were added.

Now run npm run gen. Now notice by default, it may generate not hooks, so we're gonna have to add a setting for that.
By running gen command, it's gonna create a generated folder. Now if you look at the graphql.tsx file inside that generated folder, you see
bunch of `unnamed`, that's because we didn't give a name to our graphql query. So for example for hello. So for example, instead of having this in hello.graphql:
{
    hello
}
we give it a name like:
query Hello {
    hello
}
and now if AGAIN we run npm run gen, instead of those unnamed words in generated graphql.tsx file, we see: Hello... .
Now you see you get some components in that generated file, so if you wanna use apollo components or higher order comps, this is hpw you do it,
but we're gonna use hooks.
So that file basically generates typescript types for us, based on the graphql. So this saves us work and automate some things. So that
const {data, loading} = useQuery(gql`{hello}`); , gets a little simpler.

If you look at the imports at top of that graphql.tsx, you see some errors in imports, because we don't need to generate comps or HOCs.

So now, we need to change our codegen.yml , so that it also accepts hooks.
So at it's very end, add a config line and then underneath it add some stuff. So add:
    config:
      withHOC: false
      withComponents: false
      withHooks: true
With this, we say we don't want to generate components or HOCs and we just want hooks.
Now again, run npm run gen.
So now it creates a single hook for us which in this case is named: useHelloQuery() and we can use it now.
Now instead of writing:
useQuery(gql`{hello}`);
we can use that generated hook.
Now data can possibly be undefined, so we added (... || !data) check in App.tsx too, now if you check the properties of data, you see hello
property and it;s type, so that's what graphql-codegen gives us, which is we're gonna know what types of those properties are.

So our workflow is like this:
We're gonna write a query like hello.graphql , then we're gonna generate the types for it and then in our component, we're gonna use the generated
hook.
So now we have graphql code generator all setup now.

Next, we wanna create some pages. Like register and login page. So we need react-router-dom and also the types for it, because this package
doesn't come with types, so: @types/react-router-dom

Now in App.tsx, we can put all of our routes. So rename App.tsx to Routes.tsx and also change all the things related to App in index.tsx to Routes.

Now you can get rid of that useHelloQuery() and related jsx in Routes comp.

It's better to use named exports for comps, so use:
export const Routes = () => {};

instead of:
const Routes = () => {};

export default Routes;

Now create a folder called pages.

By typing rh, you can create a new component in vscode. For creating this snippet, go to code>prefrences>user snippets , you can create your own by typing:
typescriptreact.json which the key of this snippet in that file would be:
"Typescript React Function Component", you can grab it from here:
https://www.youtube.com/redirect?event=video_description&redir_token=QUFFLUhqa2JiRzNHMmx2X1FKNVd0NFdTS1d4MEw1R0Nxd3xBQ3Jtc0tsVU1rX1lSQm1iUS1XQ2hjNGtzeGcwQVhoMEpaYktmTzk4VDJqYTZPVFQ5ZWNYd0tnOWNyeEhNWUVtSFYtWGFKTkNYaXN1WndaMUFEaXJnRGRMM3k5clY2cm9MM1ZJMnEyOXNyb2NneXlGeUQ1NS10OA&q=https%3A%2F%2Fgist.github.com%2Fbenawad%2F1e9dd01994f78489306fbfd6f7b01cd3%23file-snippets-typescriptreact-json

In Routes.tsx , we're rendering that <header>...</header> on ALL pages.

Now let's go to Register page and register some users from our frontend.

Now we wanna make a graphql request to our server, when the register button submitted. So let's create register.graphql file and there, we're gonna
write our register mutation. For writing this mutation, let's first do this in graphql playground.

In graphql, for writing variables, we put $ in front of variable name and then you specify what is the datatype.
After writing the full mutation in playground, copy it in the related graphql file.
Now we need to run: npm run gen which gonna create a hook for us. Then use that generated hook in register page.

register: true means our user got created.

If you hit ctrl+space(for example inside an object), you can see what you have access to in vscode.
So if we type a component as FC<RouterComponentProps> and pass an object to the () of that component and inside that object hit ctrl+space,
you can see the props that are passed in that component, because we made that component a route in Routes.tsx . For example we pass Register component
to component prop of a <Route /> in Routes.tsx and with that, for example, we can get the history prop in () of that component which is passed down to
it.
Now create users.graphql and then(after writing it's query), run npm run gen which is gonna create useUsersQuery() .

Passing fetchPoliciy: 'network-only' to a generated graphql query means that it is not gonna read from the cache, instead, is going to make a request
to our server EVERY TIME and this way, we don't need to worry about updating the cache.

Whenever you use map() on array in react in jsx, pass a key prop to each element and each one should have a unique value.
So now we can see all of our users in home page.

Now we want to take one of these users and login with it.
TODO: till 1:57:40*/



