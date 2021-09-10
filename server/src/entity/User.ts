import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm";
import {Field, Int, ObjectType} from "type-graphql";

@ObjectType()
@Entity('users')
export class User extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()// todo: should pass 'text' to this decorator
    email: string;

    @Column('text')// todo: should pass 'text' to this decorator
    password: string;

    @Column('int', {default: 0})
    tokenVersion: number;
}
