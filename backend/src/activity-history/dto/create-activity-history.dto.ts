import { IsNotEmpty, IsString } from "class-validator";

export class CreateActivityHistoryDto {
    @IsNotEmpty()
    user_id: number;

    @IsNotEmpty()
    @IsString()
    activity: string;
}
