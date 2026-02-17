import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Get()
    findAll() {
        return this.projectsService.findAll();
    }

    @Get('employee/:userId')
    findByEmployee(@Param('userId') userId: string) {
        return this.projectsService.findByEmployee(userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.projectsService.findOne(id);
    }

    @Post()
    create(@Body() body: any) {
        return this.projectsService.create(body);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.projectsService.update(id, body);
    }

    @Post(':id/members')
    assignMembers(@Param('id') id: string, @Body('userIds') userIds: string[]) {
        return this.projectsService.assignMembers(id, userIds);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.projectsService.remove(id);
    }
}
