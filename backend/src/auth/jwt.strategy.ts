import { UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";

export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'mAdAmL1T3',
        });
    }

    async validate(payload: any) {
        const user = await this.userRepository.findOne({ where: { user_id: payload.sub } });
        if (!user) {
            throw new UnauthorizedException("Token is invalid. Please log in again.");
        }
        const tokenIssuedAt = new Date(payload.iat * 1000).getTime();
        const passwordChangedAt = new Date(user.password_changed_at).getTime();
        if (tokenIssuedAt < passwordChangedAt) {
            throw new UnauthorizedException("Token is invalid. Please log in again.");
        }
        return {
            user_id: payload.sub,
            username: payload.username,
            role: payload.role,
            updated_at: payload.updated_at,
        };
    }
}