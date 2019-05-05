import { Injectable } from '@nestjs/common';

@Injectable()
export class NumberService {
  twice(x: number) {
    return x * 2;
  }
  thrice(x: number) {
    return x * 3;
  }
}
