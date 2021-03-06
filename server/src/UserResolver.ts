import {Arg, Ctx, Field, Int, Mutation, ObjectType, Query, Resolver, UseMiddleware} from "type-graphql";
import {User} from "./entity/User";
import {compare, hash} from "bcryptjs";
import {MyContext} from "./MyContext";
import {createAccessToken, createRefreshToken} from "./auth";
import {isAuth} from "./isAuth";
import {sendRefreshToken} from "./sendRefreshToken";
import {getConnection} from "typeorm";
import {verify} from "jsonwebtoken";

@ObjectType()
class LoginResponse {
    @Field()
    accessToken: string;

    /* We have to explicitely type the the returning type for graphql here by adding () => User to @Field() . */
    @Field(() => User)
    user: User;
}

@Resolver()
export class UserResolver {
    @Query(() => String)
    hello() {
        return "hi!";
    }

    @Query(() => String)
    @UseMiddleware(isAuth)
    bye(@Ctx() {payload}: MyContext) {
        console.log('payload is: ', payload);
        return `your user id is: ${payload!.userId}`;
    }

    @Query(() => [User])
    users() {
        return User.find();
    }

    @Mutation(() => Boolean)
    async register(@Arg('email') email: string,
                   @Arg('password') password: string) {
        const hashedPassword = await hash(password, 12);

        try {
            await User.insert({
                email,
                password: hashedPassword
            });
        } catch (err) {
            console.log(err);
            return false;
        }

        return true;
    }

    @Mutation(() => LoginResponse)
    async login(@Arg('email') email: string,
                @Arg('password') password: string,
                @Ctx() {res}: MyContext): Promise<LoginResponse> {
        const user = await User.findOne({where: {email}});

        if (!user) {
            throw new Error('could not find user');
        }

        const valid = await compare(password, user.password);

        if (!valid) {
            throw new Error('bad password');
        }

        // If we made it this far, it means the login was successful
        sendRefreshToken(res, createRefreshToken(user))

        return {
            accessToken: createAccessToken(user),
            user
        };
    }

    @Mutation(() => Boolean)
    async revokeRefreshTokensForUser(@Arg('userId', () => Int) userId: number) {
        await getConnection().getRepository(User).increment({id: userId}, 'tokenVersion', 1);
        return true;
    }

    @Query(() => User, {nullable: true})
    me(@Ctx() context: MyContext) {
        const authorization = context.req.headers['authorization'];

        if (!authorization) {
            return null;
        }

        try {
            const token = authorization.split(' ')[1];
            const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
            context.payload = payload as any;
            return User.findOne(payload.userId) // assuming if it's a valid token, it's gonna have userId in it's payload.
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    @Mutation(() => Boolean)
    async logout(@Ctx() {res}: MyContext) {
        sendRefreshToken(res, ''); // or: res.clearCookie();
        return true;
    }

}
