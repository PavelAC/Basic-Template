import { Routes } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { ConfigService } from './services/config.service';
import { firstValueFrom } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthComponent } from './components/auth/auth.component';
import { CarsComponent } from './components/cars/cars.component';

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
      data: { label: translations?.menu?.[item.label] || item.label }, // Use translated label
    }));

  const footerRoutes = config.footer.elements
    .filter((item) => item.enable)
    .map((item) => ({
      path: item.route.replace(/^\//, ''),
      component: FooterComponent,
      data: { icon: item.icon },
    }));

  return [
    {
      path: '',
      component: HeaderComponent,
      children: [
        ...menuRoutes,
        ...footerRoutes,
      ],
    },
    {
      path: 'cars',
      component: CarsComponent, 
      // redirectTo: '/',
    },
    {
      path: 'auth',
      component: AuthComponent, 
      // redirectTo: '/',
    },
    {
      path: '**',
      redirectTo: '/',
    },
  ];
}