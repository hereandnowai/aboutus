import { Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';

export const routes: Routes = [
    { path: '', component: AboutComponent, title: 'About HERE AND NOW AI' },
    { path: '**', redirectTo: '' }
];
