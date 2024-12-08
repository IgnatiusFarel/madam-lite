import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private readonly allowedRoles: string[]) {
        super();
    }

    handleRequest(err, user) {
        if (err || !user) {
            throw err || new UnauthorizedException();
        }
        // Cek apakah pengguna memiliki salah satu peran yang diizinkan
        if (this.allowedRoles && !this.allowedRoles.includes(user.role)) {
            throw new UnauthorizedException('You are not authorized to access this resource');
        }
        return user;
    }
}