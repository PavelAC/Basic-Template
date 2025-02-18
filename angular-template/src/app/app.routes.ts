import { Routes } from '@angular/router';
import { ConfigService } from './services/config.service';
import { firstValueFrom } from 'rxjs';
import { AuthComponent } from './components/auth/auth.component';
import { CarsComponent } from './components/cars/cars.component';
import { AuthGuard } from './components/auth/auth.guard';
import { HeaderComponent } from './components/header/header.component';

export async function generateRoutes(configService: ConfigService): Promise<Routes> {
  const config = await firstValueFrom(configService.getConfig()) as {
    menu: {
      elements: Array<{ label: string; route: string; enable: boolean }>;
    };
    footer: {
      elements: Array<{ icon: string; route: string; enable: boolean }>;
    };
  };

  const translations = await firstValueFrom(configService.translations$);

  if (!config) {
    console.error('Configuration is undefined or could not be loaded.');
    return [
      {
        path: '**',
        redirectTo: '/',
      },
    ];
  }

  const menuRoutes = config.menu.elements
    .filter((item) => item.enable)
    .map((item) => ({
      path: item.route.replace(/^\//, ''),
      component: HeaderComponent,
      data: { label: translations?.menu?.[item.label] || item.label },
    }));

  return [
    {
      path: '',
      redirectTo: '/auth',
      pathMatch: 'full',
    },
    {
      path: 'auth',
      component: AuthComponent,
    },
    {
      path: 'cars',
      component: CarsComponent,
      canActivate: [AuthGuard],
    },
    ...menuRoutes,
    {
      path: '**',
      redirectTo: '/',
    },
  ];
}
