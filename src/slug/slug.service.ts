import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/user.service';

@Injectable()
export class SlugService {
  constructor(private usersService: UsersService) {}
  async generateUniqueSlug(storeName: string): Promise<string> {
    if (!storeName) {
      throw new BadRequestException('Store name is required');
    }
    const baseSlug = this.generateSlug(storeName);
    let slug = baseSlug;
    let counter = 2;

    while (true) {
      const existing = await this.usersService.user({
        storeSlug: slug,
      });
      if (!existing) return slug;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }
  private generateSlug(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  }
}
