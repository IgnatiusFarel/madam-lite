import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePsychographDto {

    @IsNotEmpty()
    @IsString()
    option_value: string;
}
