import { inject } from '@angular/core';
import { CanMatchFn, RedirectCommand, Router, Routes } from '@angular/router';
import { NavbarComponent } from './header/navbar/navbar.component';

const dummyCanMatch: CanMatchFn = (route, segments) => {
    const router = inject(Router);
    const shouldGetAccess = Math.random();
    if (shouldGetAccess < 1) {
      return true;
    }
    return new RedirectCommand(router.parseUrl('/unauthorized'));
  };

export const routes: Routes = [
    {
        path:':linkId',
        component: NavbarComponent,
        // children: ,
        canMatch: [dummyCanMatch],
        data: {
            message: 'link Sucessfull!',
          },
    }
]
